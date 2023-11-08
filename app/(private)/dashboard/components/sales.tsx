import { columns } from './columns';
import { DataTable } from './data-table';
import { DynamicQR } from './dynamicQR';
import PaymentButton from './payment';

type TProps = {
  branches: TBranch[];
  sales: TSale[];
  invoices: TInvoice[];
};

export default function Sales({ branches, sales, invoices }: TProps) {
  return (
    <div className='mt-6'>
      <div className='flex justify-between'>
        <div className='font-bold'>Борлуулалтын жагсаалт</div>
        <div className='flex gap-2'>
          <DynamicQR branches={branches} />
          <PaymentButton invoices={invoices} branches={branches} />
        </div>
      </div>
      <div className='my-6'>
        <DataTable columns={columns} data={sales} />
      </div>
    </div>
  );
}
