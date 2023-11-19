'use server';

import { uniqBy } from 'lodash';
import { supabaseServiceKey, supabaseUrl } from '@/lib/supabase';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  CreateBranchSchema,
  CreateDynamicQRSchema,
  CreateStaticQRSchema,
  CreateUserSchema,
  UpdateEmployeeSchema,
} from '@/lib/schema';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { blob } from 'stream/consumers';
import { uploadFile } from '@/lib/s3';

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const supabase = createServerActionClient<Database>({ cookies });

export async function getUserDetail() {
  let isAdmin = false;
  let branches: TBranch[] = [];
  let merchants: TMerchant[] = [];
  let roles: TRole[] = [];

  // get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) throw userError;

  // get current user role
  const { data: user_role } = await supabaseAdmin
    .from('user_role')
    .select('role')
    .match({
      user_id: user?.id,
    });

  // Determine the current user is merchand admin or not
  if (user_role && user_role.length > 0) {
    isAdmin = !!user_role.find((r) => r.role == 'merchant_admin');
  }

  // Get merchants of current user
  const { data: merchant_user } = await supabaseAdmin
    .from('merchant_user')
    .select('*, merchants(*)')
    .eq('user_id', user.id);
  if (merchant_user && merchant_user.length > 0) {
    merchants = merchant_user?.map((m) => m.merchants!);
  }

  // Get branches of current Non user

  const merchants_ids = merchants.map((m) => m.id);

  if (isAdmin) {
    const { data: merchantBranches } = await supabaseAdmin
      .from('branches')
      .select('*, cities(name), districts(name)')
      .in('merchant_id', merchants_ids);
    if (merchantBranches && merchantBranches.length > 0) {
      branches = merchantBranches;
    }
  } else {
    const { data: merchant_branch_user } = await supabaseAdmin
      .from('merchant_branch_user')
      .select('*, merchants(*), branches(*)')
      .eq('user_id', user.id)
      .in('merchant_id', merchants_ids);

    if (merchant_branch_user && merchant_branch_user.length > 0) {
      branches = merchant_branch_user.map((m) => m.branches!);
    }
  }

  const { data: merchant_roles } = await supabaseAdmin
    .from('roles')
    .select()
    .match({
      name: 'merchant_user',
    });

  if (merchant_roles && merchant_roles.length > 0) {
    roles = merchant_roles;
  }

  return {
    isAdmin,
    user,
    merchants,
    branches,
    roles,
  };
}

const getBanks = async () => {
  const { data } = await supabaseAdmin.from('banks').select();

  if (data && data.length > 0) {
    return data;
  }
  return [];
};
const getCities = async () => {
  const { data } = await supabaseAdmin.from('cities').select();

  if (data && data.length > 0) {
    return data;
  }
  return [];
};
const getDistricts = async () => {
  const { data } = await supabaseAdmin.from('districts').select();

  if (data && data.length > 0) {
    return data;
  }
  return [];
};

const getInvoices = async (branch_ids: number[]) => {
  const { data } = await supabaseAdmin
    .from('invoices')
    .select()
    .eq('qr_type', 'DYNAMIC')
    .eq('status', 'NEW')
    .in('merchant_branch_id', branch_ids);

  if (data && data.length > 0) {
    return data;
  }
  return [];
};

const getSales = async (
  isAdmin: boolean,
  merchants: TMerchant[],
  branches: TBranch[],
  filters: {
    branch_id: number | null;
    from: string | null;
    to: string | null;
  }
) => {
  const sp = supabaseAdmin.from('payment_invoices').select('*, branches(*)');

  const branchIds = branches.map((b) => b.id);

  const { branch_id, from, to } = filters;

  if (branch_id) {
    sp.eq('merchant_branch_id', branch_id);
  } else {
    sp.in('merchant_branch_id', branchIds);
  }

  if (from) {
    sp.gte('created_at', from);
  }

  if (to) {
    sp.lte('created_at', to);
  }

  const { data, error } = await sp;

  if (data && data.length > 0) {
    return data;
  }
  return [];
};

const getMerchantBranchUsers = async (merchant_ids: number[]) => {
  const { data } = await supabaseAdmin
    .from('merchant_branch_user')
    .select('*, branches(*), merchants(*), user_profiles(*)')
    .in('merchant_id', merchant_ids);

  if (data && data.length > 0) {
    return data;
  }
  return [];
};

export const fetchDataDashboard = async (searchParams: TSearchParams) => {
  const banks = await getBanks();
  const cities = await getCities();
  const districts = await getDistricts();

  const data = await getUserDetail();
  const { isAdmin, merchants, branches } = data;

  const { branch_id, from, to } = searchParams;

  const filters = {
    branch_id: branch_id ? Number(String(branch_id)) : null,
    from: from ? new Date(from as string).toISOString() : null,
    to: to ? new Date(to as string).toISOString() : null,
  };

  const sales = await getSales(isAdmin, merchants, branches, filters);
  const branch_ids = branches.map((m) => m.id);
  const invoices = await getInvoices(branch_ids);

  const settledAmount =
    sales
      .filter((s) => s.status == 'CONFIRMED')
      .map((s) => s.amount)
      .reduce((a, b) => Number(a) + Number(b), 0) || 0;
  const unSettledAmount =
    invoices
      .filter((s) => s.status !== 'PAID')
      .map((s) => s.amount)
      .reduce((a, b) => Number(a) + Number(b), 0) || 0;
  const buyers = uniqBy(sales, (obj) => obj['buyer_id_number']).length;

  const statisticData = {
    sales: settledAmount + unSettledAmount,
    settledAmount,
    unSettledAmount,
    buyers,
  };

  revalidatePath('/');

  return { ...data, banks, cities, districts, sales, statisticData, invoices };
};

type TPaymentInvoice =
  Database['public']['Tables']['payment_invoices']['Insert'];

export const payInvoice = async (payment: TPaymentInvoice) => {
  const { data, error } = await supabaseAdmin
    .from('payment_invoices')
    .insert(payment)
    .select()
    .single();

  const { error: errorInvoice } = await supabaseAdmin
    .from('invoices')
    .update({
      status: 'PAID',
    })
    .eq('id', payment.invoice_id!!);

  revalidatePath('/');

  if (errorInvoice) {
    console.log(errorInvoice);
  }

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    data: data,
  };
};

export const fetchDataBranch = async () => {
  const data = await getUserDetail();
  const { isAdmin } = data;

  if (!isAdmin) {
    redirect('/403');
  }
  const banks = await getBanks();
  const cities = await getCities();
  const districts = await getDistricts();

  revalidatePath('/branch');

  return { ...data, banks, cities, districts };
};
export const fetchDataEmployee = async () => {
  const data = await getUserDetail();
  const { isAdmin } = data;

  if (!isAdmin) {
    redirect('/403');
  }
  const banks = await getBanks();
  const cities = await getCities();
  const districts = await getDistricts();

  const { merchants } = data;
  const merchant_ids = merchants.map((m) => m.id);
  const users = await getMerchantBranchUsers(merchant_ids);

  revalidatePath('/employee');

  return { ...data, banks, cities, districts, users };
};

export const handleCreateBranch = async (
  formData: z.infer<typeof CreateBranchSchema>
) => {
  try {
    const parsed = CreateBranchSchema.safeParse(formData);

    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format() };
      }
    } else {
      const {
        email,
        name,
        addr,
        phone,
        city,
        district,
        bank_account,
        bank_code,
        merchant_id,
      } = parsed.data;
      const { data: merchant } = await supabaseAdmin
        .from('merchants')
        .select('product_id')
        .eq('id', Number(merchant_id))
        .single();
      if (merchant && merchant.product_id) {
        const { data, error } = await supabaseAdmin
          .from('branches')
          .insert([
            {
              name,
              email,
              addr,
              phone,
              city_id: Number(city),
              district_id: Number(district),
              merchant_id: Number(merchant_id),
              bank_code,
              bank_account: String(bank_account),
              product_id: merchant.product_id,
            },
          ])
          .select()
          .single();

        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Шинэ салбар бүртгэгдлээ' };
      }
    }

    return { success: false, message: 'Failed to create branch' };
  } catch (e) {
    console.log('exception', e);
    return { success: false, message: 'Failed to create branch' };
  }
};

export const handleCreateUser = async (
  formData: z.infer<typeof CreateUserSchema>
) => {
  try {
    const parsed = CreateUserSchema.safeParse(formData);

    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format() };
      }
    } else {
      const {
        email,
        branch_id,
        role,
        fname,
        lname,
        phone,
        id_number,
        password,
      } = parsed.data;
      let newUserId: string;

      const { data: user_profiles_data } = await supabaseAdmin
        .from('user_profiles')
        .select()
        .match({
          email,
        })
        .single();

      if (user_profiles_data)
        return {
          success: false,
          message: 'A user with this email address has already been registered',
        };
      // create a new user
      const { data: newUser, error: newUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          password: password,
        });

      if (newUserError)
        return { success: false, message: newUserError.message };
      newUserId = newUser.user.id;

      // create a new user's profile
      const { error: user_profiles_error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: newUserId,
          id_number,
          fname: fname,
          lname: lname,
          user_type: 'MERCHANT',
          phone: phone,
          email: email,
        });
      if (user_profiles_error)
        return { success: false, message: user_profiles_error.message };
      // create a merchant user record
      const { data: merchantData } = await supabaseAdmin
        .from('branches')
        .select('merchant_id')
        .eq('id', Number(branch_id))
        .single();
      const merchant_id = merchantData!.merchant_id;
      const { error: merchant_user_error } = await supabaseAdmin
        .from('merchant_user')
        .insert({
          merchant_id,
          user_id: newUserId,
        });

      if (merchant_user_error)
        return { success: false, message: merchant_user_error.message };

      // create a merchant branch user record
      const { error: merchant_branch_user_error } = await supabaseAdmin
        .from('merchant_branch_user')
        .insert({
          merchant_id: merchant_id,
          merchant_branch_id: Number(branch_id),
          user_id: newUserId,
        });

      if (merchant_branch_user_error)
        return { success: false, message: merchant_branch_user_error.message };
      // create user role record
      const { error: user_role_error } = await supabaseAdmin
        .from('user_role')
        .insert({
          user_id: newUserId,
          role: role,
        });

      if (user_role_error)
        return { success: false, message: user_role_error.message };

      return { success: true, message: 'Хэрэглэгчийг амжилттай бүртгэлээ!' };
    }
    return { success: false, message: 'Failed to create user' };
  } catch (e) {
    console.log('exception', e);
    return { success: false, message: 'Failed to create user' };
  }
};

export const handleCreateDynamicQR = async (
  formData: z.infer<typeof CreateDynamicQRSchema>
) => {
  try {
    const parsed = CreateDynamicQRSchema.safeParse(formData);

    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format(), data: null };
      }
    } else {
      const { branch_id, amount, item } = parsed.data;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        return { success: false, message: 'unauthenticated', data: null };

      const { data: branch, error: branchError } = await supabaseAdmin
        .from('branches')
        .select('merchants(id, product_id)')
        .eq('id', Number(branch_id))
        .single();

      if (branchError) {
        console.log(branchError);
        return { success: false, message: 'branch not found', data: null };
      }

      const { id: merchant_id, product_id } = branch.merchants!;

      const { data: invoices, error: invoicesError } = await supabaseAdmin
        .from('invoices')
        .insert([
          {
            created_by: user.id,
            amount: Number(amount),
            status: 'NEW',
            merchant_id,
            merchant_branch_id: Number(branch_id),
            qr_type: 'DYNAMIC',
            product_id,
          },
        ])
        .select()
        .single();

      if (invoicesError) {
        return { success: false, message: invoicesError.message, data: null };
      } else if (invoices) {
        revalidateTag('invoices');
        return {
          success: true,
          message: 'Succeeded to create dynamic QR',
          data: { ...invoices },
        };
      }
    }
    return {
      success: true,
      message: 'Failed to create dynamic QR',
      data: null,
    };
  } catch (e) {
    console.log('exception', e);
    return {
      success: false,
      message: 'Failed to create dynamic QR',
      data: null,
    };
  }
};

export const handleCreateStaticQR = async (
  formData: z.infer<typeof CreateStaticQRSchema>
) => {
  try {
    const parsed = CreateStaticQRSchema.safeParse(formData);

    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format(), data: null };
      }
    } else {
      const { branch_id, item } = parsed.data;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        return { success: false, message: 'unauthenticated', data: null };

      const { data: branch, error: branchError } = await supabaseAdmin
        .from('branches')
        .select('merchants(id, product_id)')
        .eq('id', Number(branch_id))
        .single();
      if (branchError)
        return { success: false, message: 'branch not found', data: null };

      const { id: merchant_id, product_id } = branch.merchants!;

      const { data: invoices, error: invoicesError } = await supabaseAdmin
        .from('invoices')
        .insert([
          {
            created_by: user.id,
            status: 'NEW',
            merchant_id,
            merchant_branch_id: Number(branch_id),
            qr_type: 'STATIC',
            product_id,
          },
        ])
        .select()
        .single();

      if (invoicesError) {
        return { success: false, message: invoicesError.message, data: null };
      } else if (invoices) {
        revalidatePath('/branch');
        return {
          success: true,
          message: 'Succeeded to create static QR',
          data: { ...invoices },
        };
      }
    }
    return { success: true, message: 'Failed to create static QR', data: null };
  } catch (e) {
    console.log('exception', e);
    return {
      success: false,
      message: 'Failed to create static QR',
      data: null,
    };
  }
};

export const handleDeleteBranch = async (id: number) => {
  const { error } = await supabaseAdmin.from('branches').delete().eq('id', id);

  if (error) return { success: false, message: error.message, data: null };

  return { success: true, message: 'Branch has been deleted!', data: null };
};

export const handleUpdateBranch = async (
  id: number,
  formData: z.infer<typeof CreateBranchSchema>
) => {
  try {
    const parsed = CreateBranchSchema.safeParse(formData);
    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format() };
      }
    } else {
      const {
        name,
        email,
        addr,
        phone,
        city,
        district,
        merchant_id,
        bank_code,
        bank_account,
      } = parsed.data;
      const { data, error } = await supabaseAdmin
        .from('branches')
        .update({
          name,
          email,
          addr,
          phone,
          city_id: Number(city),
          district_id: Number(district),
          merchant_id: Number(merchant_id),
          bank_code,
          bank_account,
        })
        .eq('id', id)
        .select();

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Successfully updated branch' };
    }

    return { success: false, message: 'Failed to update branch' };
  } catch (e) {
    console.log('exception', e);
    return { success: false, message: 'Failed to update branch' };
  }
};

export const handleDeleteEmployee = async (id: number) => {
  const { data, error } = await supabaseAdmin
    .from('merchant_branch_user')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) return { success: false, message: error.message, data: null };

  if (data && data.user_id) {
    const { error: userProfilesError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', data.user_id);
    if (userProfilesError)
      return { success: false, message: userProfilesError.message, data: null };
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      data.user_id
    );
    if (authError)
      return { success: false, message: authError.message, data: null };

    return { success: true, message: 'User has been deleted!', data: null };
  }

  return { success: false, message: 'Something went wrong!', data: null };
};

export const handleUpdateEmployee = async (
  id: number,
  formData: z.infer<typeof UpdateEmployeeSchema>
) => {
  try {
    const parsed = UpdateEmployeeSchema.safeParse(formData);
    if (!parsed.success) {
      if (parsed.error) {
        return { success: false, message: parsed.error.format() };
      }
    } else {
      const { branch_id, fname, lname, phone, id_number } = parsed.data;
      const { data: employeeData, error: employeeError } = await supabaseAdmin
        .from('merchant_branch_user')
        .update({
          merchant_branch_id: Number(branch_id),
        })
        .eq('id', id)
        .select()
        .single();

      if (employeeError) {
        return { success: false, message: employeeError.message };
      }

      if (employeeData && employeeData.user_id) {
        const { data: ProfileData, error: ProfileError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            fname,
            lname,
            id_number,
            phone,
          })
          .eq('user_id', employeeData.user_id)
          .select()
          .single();

        if (ProfileData) {
          return { success: true, message: 'Successfully updated user' };
        } else if (ProfileError) {
          return { success: true, message: ProfileError.message };
        }
      }
      return { success: false, message: 'Failed to update user' };
    }

    return { success: false, message: 'Failed to update user' };
  } catch (e) {
    console.log('exception', e);
    return { success: false, message: 'Failed to update user' };
  }
};

export const fetchWave = async (speech: string) => {
  const result = await fetch('https://api.chimege.com/v1.2/normalize-text', {
    method: 'POST',
    body: speech,
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': 'keyloak',
      'Access-Control-Allow-Headers': 'token',
      'Content-Type': 'plain/text',
      token: 'c478e7097855cc25cf6b98ab687c75895ff8d84dbb20a84bc61c7755b6d60efe',
    },
  });

  const normalized = await result.text();
  console.log('normalized', normalized);

  const audio = await fetch('https://api.chimege.com/v1.2/synthesize', {
    method: 'POST',
    body: normalized,
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Headers': 'token',
      'Content-Type': 'plain/text',
      token: 'c478e7097855cc25cf6b98ab687c75895ff8d84dbb20a84bc61c7755b6d60efe',
    },
  });

  const filename = randomUUID();
  const filePath = path.join(process.cwd(), 'public', filename + '.wav');
  // const blob = await audio.blob();
  // const file = new File([blob], filePath, {
  //   type: blob.type,
  // });

  const r = await audio.arrayBuffer();
  // uploadFile(filename + '.wav', r);
  // writeFileSync(filePath, new DataView(r));

  return 'data:audio/wav;base64,' + arrayBufferToBase64(r);
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const binary = new Uint8Array(buffer);
  const bytes = binary.reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ''
  );
  return btoa(bytes);
}
