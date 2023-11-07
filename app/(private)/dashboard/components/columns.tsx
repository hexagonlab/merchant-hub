'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';
import { format } from 'date-fns';
import { mn } from 'date-fns/locale';
import { statuses } from '../data/data';
export const columns: ColumnDef<TSale>[] = [
  {
    id: 'merchant_branch_id',
    accessorKey: 'merchant_branch_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Салбар' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    accessorFn: (row) => row.branches?.name,
  },
  {
    id: 'buyer_phone',
    accessorKey: 'buyer_phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Утасны дугаар' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Огноо' />
    ),
    accessorFn: (row) =>
      format(new Date(row.created_at), 'y.MM.dd HH:mm', {
        locale: mn,
      }),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'invoice_id',
    accessorKey: 'invoice_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Гүйлгээний дугаар' />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Гүйлгээний дүн' />
    ),
    accessorFn: (row) => `${row.amount?.toLocaleString()} ₮`,
    filterFn: (row, id, value) => {
      return `${Number(value)?.toLocaleString()} ₮`.includes(row.getValue(id));
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Төлөв' />
    ),
    cell: ({ row }) => {
      let status;
      if (row.getValue('status') !== 'CONFIRMED') {
        status = statuses.find((status) => status.value !== 'CONFIRMED');
      } else {
        status = statuses.find((status) => status.value === 'CONFIRMED');
      }
      if (!status) {
        return null;
      }

      return (
        <div className='flex w-[150px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      if (value.length == 1 && value.includes('UNSETTLED')) {
        return ['CONFIRMED', 'PAID'].includes(row.getValue(id));
      } else if (value.length == 1 && value.includes('SETTLED')) {
        return ['SETTLED'].includes(row.getValue(id));
      }
      return true;
    },
  },
  // {
  //   id: 'fullName',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Хэрэглэгч' />
  //   ),
  //   accessorFn: (row) => `${row.buyer_fname} ${row.buyer_lname}`,
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
];
