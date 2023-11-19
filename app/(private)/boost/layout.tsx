import React from 'react';

import { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TopbarNav from './top-nav';

export const metadata: Metadata = {
  title: 'Forms',
  description: 'Advanced form example using react-hook-form and Zod.',
};

const sidebarNavItems = [
  {
    title: 'Хэрэглэгч хадгалах',
    href: '/boost/retain',
  },
  {
    title: 'Хэрэглэгч татах',
    href: '/boost/acquire',
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function Page({ children }: SettingsLayoutProps) {
  return (
    <div className='flex-grow px-6 xl:px-24 flex flex-col'>
      <div className='flex-grow'>
        <TopbarNav items={sidebarNavItems} />
        {children}
      </div>
    </div>
  );
}
