import { columns } from './columns';
import { DataTable } from './data-table';
import { DynamicQR } from './dynamicQR';

type TProps = {
  branches: TBranch[];
  sales: TSale[];
};

export default function Sales({ branches, sales }: TProps) {
  return (
    <div className='mt-6'>
      <div className='flex justify-between'>
        <div className='font-bold'>Борлуулалтын жагсаалт</div>
        <DynamicQR branches={branches} />
      </div>
      <div className='my-6'>
        <DataTable columns={columns} data={sales} />
      </div>
    </div>
  );
}
