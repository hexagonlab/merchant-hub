'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

import { UpdateEmployeeSchema } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Dispatch, SetStateAction } from 'react';
import { handleUpdateEmployee } from '@/app/(private)/dashboard/actions';

type TProps = {
  branches: TBranch[];
  roles: TRole[];
  state: {
    open: boolean;
    employee: TEmployee | null;
  };
  setState: Dispatch<
    SetStateAction<{
      open: boolean;
      employee: TEmployee | null;
    }>
  >;
};

export default function UpdateDialog({ branches, state, setState }: TProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof UpdateEmployeeSchema>>({
    resolver: zodResolver(UpdateEmployeeSchema),
    values: {
      branch_id: String(state.employee?.merchant_branch_id),
      fname: state.employee?.user_profiles?.fname || '',
      lname: state.employee?.user_profiles?.lname || '',
      phone: state.employee?.user_profiles?.phone || '',
      id_number: state.employee?.user_profiles?.id_number || '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof UpdateEmployeeSchema>) => {
    const { success, message } = await handleUpdateEmployee(
      state.employee?.id as number,
      formData
    );

    if (success) {
      toast({
        title: 'Амжилттай',
        description: message as string,
      });

      window.location.reload();
    } else {
      toast({
        title: 'Алдаа гарлаа',
        description: message?.toString(),
      });
    }
  };

  const onOpenChange = () => {
    setState((prev) => {
      return {
        ...prev,
        open: false,
      };
    });
  };

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[728px] max-h-screen overflow-scroll'>
        <DialogHeader>
          <DialogTitle>Ажилтаны бүртгэл засах</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4 items-center'
          >
            <FormField
              control={form.control}
              name='branch_id'
              render={({ field }) => (
                <FormItem className=' col-span-2'>
                  <FormLabel>Салбар</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Салбар сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {branches.map((branch) => (
                        <SelectItem value={String(branch.id)} key={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Овог</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Овог бичих' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нэр</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Нэр бичих' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='id_number'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Регистрийн дугаар</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='РД12345678' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Утасны дугаар</FormLabel>
                  <FormControl>
                    <Input {...field} type='number' placeholder='99999999' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div></div>
            <div className='flex justify-end items-center gap-2'>
              <DialogClose asChild>
                <Button type='button' variant='outline' className='font-bold'>
                  Цуцлах
                </Button>
              </DialogClose>
              <Button type='submit' className='font-bold'>
                Бүртгэх
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
