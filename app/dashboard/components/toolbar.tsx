'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { format, addHours } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarIcon, CaretSortIcon } from '@radix-ui/react-icons';
import { Building } from 'lucide-react';

type TProps = {
  branches: TBranch[];
  isAdmin: boolean;
};

export default function Toolbar({ branches, isAdmin }: TProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  let branch_id: string;
  if (isAdmin) {
    branch_id = searchParams.get('branch_id') || '999';
  } else {
    branch_id = String(branches[0].id);
  }
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  const [date, setDate] = useState<DateRange | undefined>({
    from: fromDate ? new Date(fromDate) : undefined,
    to: toDate ? new Date(toDate) : undefined,
  });

  const handleOnSelectDateRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams);

    if (range && range.from) {
      const from = addHours(range.from, 8).toISOString().split('T')[0];
      params.set('from', from);
    }
    if (range && !range.from) {
      params.delete('from');
    }

    if (range && range.to) {
      const to = addHours(range.to, 8).toISOString().split('T')[0];
      params.set('to', to);
    }
    if (range && !range.to) {
      params.delete('to');
    }

    if (!range) {
      params.delete('from');
      params.delete('to');
    }

    router.push(pathname + '?' + params);
    setDate(range);
  };

  const handleOnSelectBranch = (branch_id: string) => {
    const params = new URLSearchParams(searchParams);
    if (branch_id == '999') {
      params.delete('branch_id');
    } else {
      params.set('branch_id', branch_id);
    }
    router.push(pathname + '?' + params);
  };

  return (
    <div className='my-6 flex justify-between items-center'>
      <div className='font-bold'>Статистик</div>
      <div className='grid grid-cols-2 gap-4'>
        {isAdmin ? (
          <Select onValueChange={handleOnSelectBranch} defaultValue={branch_id}>
            <SelectTrigger>
              <div className='flex gap-2 items-center'>
                <Building className='h-4 w-4 text-primary-500' />
                <SelectValue placeholder='Бүгд' />
              </div>
            </SelectTrigger>
            <SelectContent className=' max-h-60 max-w-40 overflow-auto'>
              {isAdmin ? (
                <SelectItem value='999' key={999}>
                  Бүгд
                </SelectItem>
              ) : null}

              {branches.map((branch) => (
                <SelectItem value={String(branch.id)} key={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id='date'
              variant='outline'
              className={cn(
                'w-auto justify-around text-left font-normal bg-gray-100 gap-4',
                !date && 'text-muted-foreground'
              )}
            >
              <div className='flex items-center font-normal'>
                <CalendarIcon className='mr-2 h-4 w-4 text-primary-500' />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'MM.dd, y')} -{' '}
                      {format(date.to, 'MM.dd, y')}
                    </>
                  ) : (
                    format(date.from, 'MM.dd, y')
                  )
                ) : (
                  <span>Огноо сонгох</span>
                )}
              </div>
              <CaretSortIcon className='h-4 w-4 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end'>
            <Calendar
              initialFocus
              mode='range'
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => handleOnSelectDateRange(range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
