'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TopbarProps = {
  items: { title: string; href: string }[];
};
function TopbarNav({ items }: TopbarProps) {
  const pathname = usePathname();

  return (
    <div className='flex items-center justify-center gap-2 mt-4'>
      {items.map((item, index) => (
        <Button
          asChild
          key={index}
          variant={pathname == item.href ? 'default' : 'outline'}
        >
          <Link href={item.href}>{item.title}</Link>
        </Button>
      ))}
    </div>
  );
}

export default TopbarNav;
