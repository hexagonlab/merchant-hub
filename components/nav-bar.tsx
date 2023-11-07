import Link from 'next/link';
import {
  User,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import { cn } from '@/lib/utils';
import { cookies, headers } from 'next/headers';
import Image from 'next/image';
import logo from '../public/logo-light.png';
import { Button } from './ui/button';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { User as UserIcon, LogOut as LogOutIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const dynamic = 'force-dynamic';

const ADMIN_MENUS = [
  {
    title: 'Хянах самбар',
    href: '/dashboard',
  },
  {
    title: 'Салбар',
    href: '/branch',
  },
  {
    title: 'Ажилчид',
    href: '/employee',
  },
];

const USER_MENUS = [
  {
    title: 'Хянах самбар',
    href: '/dashboard',
  },
];

type Menu = {
  title: string;
  href: string;
};

const fetchData = async () => {
  let user: User | null = null;
  let menus: Menu[] = [];
  const headersList = headers();
  const pathName = headersList.get('x-current-pathname') || '';

  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getUser();
  if (data && data.user) {
    user = data.user;
    const { data: roleData } = await supabase
      .from('user_role')
      .select('role')
      .match({
        user_id: data.user.id,
      });
    if (roleData && roleData.length > 0) {
      const mappedRoles = roleData.map((r) => r.role);
      if (mappedRoles.includes('merchant_admin')) {
        menus = ADMIN_MENUS;
      } else {
        menus = USER_MENUS;
      }
    }
  }

  return {
    user,
    menus,
    pathName,
  };
};

export default async function NavBar() {
  const { user, menus, pathName } = await fetchData();

  return (
    <nav className='w-full flex justify-between border-b border-b-foreground/10 h-16 px-6 xl:px-24 text-sm'>
      <div className='flex items-center text-2xl font-bold'>
        <span className='text-primary-500'>MERCHANT</span>
        <span>&nbsp;HUB</span>
      </div>

      <div className='flex justify-center items-center gap-2 px-2'>
        {menus.map((m) => {
          return (
            <Link
              href={m.href}
              key={m.title}
              className={cn(
                'flex items-center px-4 h-full font-bold',
                pathName == m.href
                  ? 'text-primary-500 border-b-2 border-b-primary-500'
                  : ''
              )}
            >
              {m.title}
            </Link>
          );
        })}
      </div>

      <div className='flex items-center space-x-1 rounded-md text-primary-500 cursor-pointer'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='px-2 shadow-none focus:border-primary-500 focus:ring-primary-500'
            >
              <UserIcon className='mr-2 h-4 w-4' />
              {user?.email}
              <ChevronDownIcon className='ml-2 h-4 w-4 text-primary-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[150px]' forceMount>
            <form action='/auth/sign-out' method='post'>
              <DropdownMenuItem className='cursor-pointer'>
                <button className='font-bold text-sm text-gray-800 flex items-center w-full'>
                  <LogOutIcon className='w-4 h-4 mr-2' />
                  Гарах
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
