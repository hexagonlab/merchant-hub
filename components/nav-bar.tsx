import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  User,
  createServerComponentClient,
} from '@supabase/auth-helpers-nextjs';
import { LogOut as LogOutIcon, User as UserIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import MenuList from './menu-list';
import { Button } from './ui/button';
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
    href: '/',
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
    href: '/',
  },
];

export type Menu = {
  title: string;
  href: string;
};

const fetchData = async () => {
  let user: User | null = null;
  let menus: Menu[] = [];

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
  };
};

export default async function NavBar() {
  const { user, menus } = await fetchData();

  return (
    <nav className='w-full flex justify-between border-b border-b-foreground/10 h-16 px-6 xl:px-24 text-sm'>
      <div className='flex items-center text-2xl font-bold'>
        <span className='text-primary-500'>MERCHANT</span>
        <span>&nbsp;HUB</span>
      </div>

      <div className='flex justify-center items-center gap-2 px-2'>
        <MenuList menus={menus} />
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
