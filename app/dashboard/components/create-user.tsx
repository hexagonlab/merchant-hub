'use client';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { handleCreateUser } from '../actions';
import { CreateUserSchema } from '@/lib/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

type TProps = {
  branches: TBranch[];
  roles: TRole[];
};

export default function CreateUser({ branches, roles }: TProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      fname: '',
      id_number: '',
      lname: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (formData: z.infer<typeof CreateUserSchema>) => {
    const { success, message } = await handleCreateUser(formData);

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className='p-3 rounded-3xl border border-primary-500 cursor-pointer hover:bg-primary-300'>
          <div className='flex items-center gap-3 justify-start'>
            <div className='w-12 h-12 grid place-content-center bg-primary-100 rounded-xl'>
              <User className='w-5 h-5 text-primary-500' />
            </div>
            <div className='flex flex-col'>
              <div className='text-gray-500 font-semibold text-xs'>
                2-р алхам
              </div>
              <div className='font-bold'>Ажилтан бүртгэх</div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[728px] max-h-screen overflow-scroll'>
        <DialogHeader>
          <DialogTitle>Ажилтан бүртгэх</DialogTitle>
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
              name='role'
              render={({ field }) => (
                <FormItem className=' col-span-2'>
                  <FormLabel>Эрхийн төвшин</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Эрхийн төвшин сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {roles.map((role) => (
                        <SelectItem value={String(role.name)} key={role.name}>
                          {role.description}
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
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цахим шуудан</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Нэвтрэх цахим шуудан'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Нууц үг</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='Нэвтрэх нууц үг'
                    />
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
