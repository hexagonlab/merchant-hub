'use client';
import { usePathname } from 'next/navigation';
import { Menu } from './nav-bar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type MenuProps = {
  menus: Menu[];
};

export default function MenuList({ menus }: MenuProps) {
  const pathname = usePathname();
  return (
    <>
      {menus.map((m) => {
        return (
          <Link
            href={m.href}
            key={m.title}
            className={cn(
              'flex items-center px-4 h-full font-bold',
              pathname == m.href
                ? 'text-primary-500 border-b-2 border-b-primary-500'
                : ''
            )}
          >
            {m.title}
          </Link>
        );
      })}
    </>
  );
}
