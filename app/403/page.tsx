import { Card, CardContent } from '@/components/ui/card';

export default function Custom404() {
  return (
    <div className='flex-grow grid justify-center bg-theme-img bg-center items-center'>
      <div className='flex flex-col w-[380px] justify-center'>
        <Card className=' rounded-3xl shadow-sm shadow-primary'>
          <div className='flex items-center px-8 py-6 justify-center text-3xl font-bold'>
            <span className='text-primary-500'>MERCHANT</span>
            <span>&nbsp;HUB</span>
          </div>
          <CardContent className='text-center text-2xl font-semibold'>
            403 - Unauthorized
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
