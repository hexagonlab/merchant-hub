'use client';

import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from './data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Delete, Edit, MoreHorizontal, Trash, Trash2 } from 'lucide-react';
import DeleteDialog from './delete-dialog';
import { useState } from 'react';
import UpdateDialog from './update-dialog';

type TProps = {
  branches: TBranch[];
  cities: TCity[];
  districts: TDistrict[];
  merchants: TMerchant[];
  banks: TBank[];
};

export default function BranchList({
  branches,
  merchants,
  cities,
  districts,
  banks,
}: TProps) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    branchId: number | null;
  }>({
    open: false,
    branchId: null,
  });

  const [updateDialogState, setUpdateDialogState] = useState<{
    open: boolean;
    branch: TBranch | null;
  }>({
    open: false,
    branch: null,
  });

  const onDelete = (branch: TBranch) => {
    setDeleteDialogState({
      open: true,
      branchId: branch.id,
    });
  };

  const onUpdate = (branch: TBranch) => {
    setUpdateDialogState({
      open: true,
      branch,
    });
  };

  const columns: ColumnDef<TBranch>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Нэр' />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'bank_account',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Дансны дугаар' />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Цахим шуудан' />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Утасны дугаар' />
      ),
    },
    {
      accessorKey: 'addr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Хаяг, байршил' />
      ),
    },
    {
      id: 'city',
      accessorKey: 'cities.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Хот' />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'districts.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Дүүрэг' />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        const branch = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => onUpdate(branch)}
                className='cursor-pointer font-bold'
              >
                <Edit className='w-4 h-4 mr-2' />
                Засах
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(branch)}
                className='cursor-pointer text-red hover:text-red font-bold'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Устгах
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  return (
    <>
      <DataTable columns={columns} data={branches} />
      <DeleteDialog state={deleteDialogState} setState={setDeleteDialogState} />
      <UpdateDialog
        state={updateDialogState}
        setState={setUpdateDialogState}
        cities={cities}
        districts={districts}
        merchants={merchants}
        banks={banks}
      />
    </>
  );
}
