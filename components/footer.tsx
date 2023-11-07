import Link from 'next/link';
import logo from '../public/logo-light.png';
import Image from 'next/image';

export default async function Footer() {
  return (
    <footer className='w-full flex justify-between border-t border-t-foreground/10 h-12 px-6 xl:px-24 text-sm items-center font-bold'>
      <div className='flex items-center gap-4'>
        <div className='flex items-center'>
          <span className='text-primary-500'>MERCHANT</span>
          <span>&nbsp;HUB</span>
        </div>
      </div>
      <div>© 2023, Khamble boys, Khanbank-Hackathon-2023</div>
    </footer>
  );
}
