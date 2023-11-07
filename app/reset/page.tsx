'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z
  .object({
    password1: z.string().min(6, {
      message: 'Хамгийн багадаа 6 тэмдэгт оруулах',
    }),
    password2: z.string().min(6, {
      message: 'Хамгийн багадаа 6 тэмдэгт оруулах',
    }),
  })
  .refine((data) => data.password1 === data.password2, {
    message: 'Баталгаажуулах нууц үг буруу',
    path: ['password2'],
  });

export default function Forgot() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password1: '',
      password2: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { password1: new_password } = values;
    const { error } = await supabase.auth.updateUser({
      password: new_password,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Алдаа',
        description: error.message,
      });
    } else {
      toast({
        title: 'Амжилттай',
        description: 'Нууц үг амжилттай сэргээгдлээ!',
      });
      router.push('/login');
    }
  };

  return (
    <div className='flex-grow grid justify-center bg-theme-img bg-center'>
      <div className='flex flex-col w-[380px] justify-center'>
        <Card className=' rounded-3xl shadow-sm shadow-primary'>
          <div className='flex items-center px-8 py-6 justify-center text-2xl font-bold'>
            <span className='text-primary-500'>MERCHANT</span>
            <span>&nbsp;HUB</span>
          </div>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                <FormField
                  control={form.control}
                  name='password1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нууц үг</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='••••••••'
                          {...field}
                          required
                          type='password'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нууц үг давтах</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='••••••••'
                          {...field}
                          required
                          type='password'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit'>Шинэчлэх</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
