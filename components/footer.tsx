import Link from 'next/link';
import logo from '../public/logo-light.png';
import Image from 'next/image';

export default async function Footer() {
  return (
    <footer className='w-full flex justify-between border-t border-t-foreground/10 h-12 px-6 xl:px-24 text-sm items-center font-bold'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center'>
          <Image
            src={logo}
            alt='Logo'
            // Make the image display full width
            style={{
              width: 'auto',
              height: '16px',
            }}
          />
        </div>
        <Link href='https://gopay.mn/' target='_blank'>
          Бидний тухай
        </Link>
        <Link
          href='https://developer.gopay.mn/term-privacy/terms/'
          target='_blank'
        >
          Үйлчилгээний нөхцөл
        </Link>
        <Link
          href='https://developer.gopay.mn/term-privacy/privacy/'
          target='_blank'
        >
          Нууцлалын бодлого
        </Link>
      </div>
      <div>© 2023, Asset Hub LLC</div>
    </footer>
  );
}
