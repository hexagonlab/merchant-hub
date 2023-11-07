import { Database as DB } from '@/types/database.types';

declare global {
  type Database = DB;
  type TBank = DB['public']['Tables']['banks']['Row'];
  type TCity = DB['public']['Tables']['cities']['Row'];
  type TDistrict = DB['public']['Tables']['districts']['Row'];
  type TUserMerchant = DB['public']['Tables']['merchant_user']['Row'];
  type TMerchant = DB['public']['Tables']['merchants']['Row'];
  type TBranch = DB['public']['Tables']['branches']['Row'];
  type TInvoice = DB['public']['Tables']['invoices']['Row'];
  type TQRData = {
    branch_id: number | null;
    merchant_id: number | null;
    product_id: number | null;
    amount?: number | string | null;
    item?: string | null;
    type: 'STATIC' | 'DYNAMIC';
  };
  type TTotalSales = DB['public']['Functions']['total_sales']['Returns'];
  type TSettledAmount = DB['public']['Functions']['settled_amount']['Returns'];
  type TUnSettledAmount =
    DB['public']['Functions']['unsettled_amount']['Returns'];
  type TTotalBuyers = DB['public']['Functions']['total_buyers']['Returns'];
  type TPaymentInvoice = DB['public']['Tables']['payment_invoices']['Row'];
  type TSale = DB['public']['Tables']['payment_invoices']['Row'] & {
    branches: TBranch | null;
  };
  type TMerchantBranchUser =
    DB['public']['Tables']['merchant_branch_user']['Row'];
  type TRole = DB['public']['Tables']['roles']['Row'];
  type TUserProfiles = DB['public']['Tables']['user_profiles']['Row'];
  type TUserRole = DB['public']['Tables']['user_role']['Row'];
  type TSearchParams = { [key: string]: string | string[] | undefined };
  type TEmployee = TMerchantBranchUser & {
    branches: TBranch | null;
    merchants: TMerchant | null;
    user_profiles: TUserProfiles | null;
  };
}
