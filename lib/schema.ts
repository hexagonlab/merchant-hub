import z from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email('Формат буруу'),
  branch_id: z.string(),
  role: z.string(),
  fname: z.string(),
  lname: z.string(),
  phone: z.string(),
  id_number: z.string(),
  password: z.string().min(6, 'Хамгийн багадаа 6 тэмдэгт оруулах'),
});

export const UpdateEmployeeSchema = z.object({
  branch_id: z.string(),
  fname: z.string(),
  lname: z.string(),
  phone: z.string(),
  id_number: z.string(),
});

export const CreateBranchSchema = z.object({
  name: z.string().min(2, {
    message: 'Хамгийн багадаа 2 тэмдэгт оруулах',
  }),
  email: z.string().email('Формат буруу'),
  addr: z.string().min(2, {
    message: 'Хамгийн багадаа 2 тэмдэгт оруулах',
  }),
  phone: z.string().min(8, {
    message: 'Хамгийн багадаа 8 тэмдэгт оруулах',
  }),
  city: z.string(),
  district: z.string(),
  bank_code: z.string(),
  bank_account: z.string().min(9, {
    message: 'Хамгийн багадаа 9 тэмдэгт оруулах',
  }),
  merchant_id: z.string(),
});

export const DashboardToolbarSchema = z.object({
  branch: z.string(),
  dateRange: z.string(),
});

export const CreateDynamicQRSchema = z.object({
  branch_id: z.string(),
  amount: z.string(),
  item: z.string().optional(),
});

export const CreateStaticQRSchema = z.object({
  branch_id: z.string(),
  item: z.string().optional(),
});
