'use client';

import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

export function DatePicker({
  className,
  setCurrent,
}: React.HTMLAttributes<HTMLDivElement> & {
  setCurrent: (value: Date) => void;
}) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={(val) => setOpen(val)}>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-auto justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? format(date, 'LLL dd, y') : <span>Огноо сонгох</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='default'
            defaultMonth={date}
            selected={date}
            onDayClick={(value) => {
              setDate(value);
              setCurrent(value);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
