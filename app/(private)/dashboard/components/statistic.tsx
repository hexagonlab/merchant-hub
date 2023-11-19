import { Card } from '@/components/ui/card';
import { Banknote, CheckCircle, Users, XCircle } from 'lucide-react';

type TProps = {
  data: {
    sales: number;
    settledAmount: number;
    unSettledAmount: number;
    buyers: number;
  };
};

export default function Statistic({ data }: TProps) {
  const { sales, settledAmount, unSettledAmount, buyers } = data;
  return (
    <div className='mt-6 grid grid-cols-4 gap-6 text-gray-500'>
      <Card className=' p-6'>
        <div className='flex items-center justify-between text-sm font-semibold'>
          <div>Нийт орлого</div>
          <Banknote className='w-4 h-4' />
        </div>
        <div className=' text-3xl font-bold mt-3'>
          {sales.toLocaleString()} ₮
        </div>
      </Card>
      <Card className=' p-6'>
        <div className='flex items-center justify-between text-sm font-semibold'>
          <div>Амжилттай төлбөр</div>
          <CheckCircle className='w-4 h-4' />
        </div>
        <div className=' text-3xl font-bold mt-3'>
          {settledAmount.toLocaleString()} ₮
        </div>
      </Card>
      <Card className=' p-6'>
        <div className='flex items-center justify-between text-sm font-semibold'>
          <div>Төлөгдсөн төлбөр</div>
          <XCircle className='w-4 h-4' />
        </div>
        <div className=' text-3xl font-bold mt-3'>
          {unSettledAmount.toLocaleString()} ₮
        </div>
      </Card>
      <Card className=' p-6'>
        <div className='flex items-center justify-between text-sm font-semibold'>
          <div>Худалдан авагчид</div>
          <Users className='w-4 h-4' />
        </div>
        <div className=' text-3xl font-bold mt-3'>{buyers}</div>
      </Card>
    </div>
  );
}
