import { Card, CardContent, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import logo from '../../public/logo-light.png';

export default function Custom404() {
  return (
    <div className='flex-grow grid justify-center bg-theme-img bg-center items-center'>
      <div className='flex flex-col w-[380px] justify-center'>
        <Card className=' rounded-3xl shadow-sm shadow-primary'>
          <div className='flex items-center px-8 py-6 justify-center'>
            <Image
              src={logo}
              alt='Logo'
              sizes='10vw'
              // Make the image display full width
              style={{
                width: '50%',
                height: 'auto',
              }}
            />
          </div>
          <CardContent className='text-center text-2xl font-semibold'>
            403 - Unauthorized
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
