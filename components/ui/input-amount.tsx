import * as React from 'react';

import { cn } from '@/lib/utils';
import { Banknote } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputAmount = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className='relative flex items-center'>
        <Banknote className='w-4 h-4 absolute ml-3.5 text-primary-500 pointer-events-none' />
        <input
          type='number'
          aria-autocomplete='none'
          autoComplete='off'
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-200 text-xs pl-9 bg-gray-100 hover:border-primary-500 focus:outline-none focus:border-primary-500 focus:ring-0.5 focus:ring-primary-500 invalid:border-red focus:invalid:border-red focus:invalid:ring-red',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
InputAmount.displayName = 'Input';

export { InputAmount };
