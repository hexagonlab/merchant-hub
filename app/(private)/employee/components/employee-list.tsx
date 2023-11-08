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
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import DeleteDialog from './delete-dialog';
import { useState } from 'react';
import UpdateDialog from './update-dialog';

type TProps = {
  employees: TEmployee[];
  branches: TBranch[];
  roles: TRole[];
};

export default function EmployeeList({ employees, branches, roles }: TProps) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    employeeId: number | null;
  }>({
    open: false,
    employeeId: null,
  });

  const [updateDialogState, setUpdateDialogState] = useState<{
    open: boolean;
    employee: TEmployee | null;
  }>({
    open: false,
    employee: null,
  });

  const onDelete = (employee: TEmployee) => {
    setDeleteDialogState({
      open: true,
      employeeId: employee.id,
    });
  };

  const onUpdate = (employee: TEmployee) => {
    setUpdateDialogState({
      open: true,
      employee,
    });
  };

  const columns: ColumnDef<TEmployee>[] = [
    {
      accessorKey: 'branches.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Салбар' />
      ),
    },
    {
      accessorKey: 'user_profiles.fname',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Нэр' />
      ),
    },
    {
      id: 'email',
      accessorKey: 'user_profiles.email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Цахим шуудан' />
      ),
    },
    {
      accessorKey: 'user_profiles.phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Утасны дугаар' />
      ),
    },
    {
      accessorKey: 'user_profiles.id_number',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Регистрийн дугаар' />
      ),
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        const employee = row.original;

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
                onClick={() => onUpdate(employee)}
                className='cursor-pointer font-bold'
              >
                <Edit className='w-4 h-4 mr-2' />
                Засах
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(employee)}
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
      <DataTable columns={columns} data={employees} />
      <DeleteDialog state={deleteDialogState} setState={setDeleteDialogState} />
      <UpdateDialog
        state={updateDialogState}
        setState={setUpdateDialogState}
        branches={branches}
        roles={roles}
      />
    </>
  );
}
