import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete='off'
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-200 text-sm px-4 bg-gray-100 hover:border-primary-500 focus:outline-none focus:border-primary-500 focus:ring-0.5 focus:ring-primary-500 invalid:border-red focus:invalid:border-red focus:invalid:ring-red',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
