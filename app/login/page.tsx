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
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import logo from '../../public/logo-light.png';
import { Checkbox } from '@/components/ui/checkbox';
import { InputEmail } from '@/components/ui/input-email';
import { InputPassword } from '@/components/ui/input-password';

const formSchema = z.object({
  email: z.string().email({
    message: 'Формат буруу',
  }),
  password: z.string().min(6, {
    message: 'Хамгийн багадаа 6 тэмдэгт оруулах',
  }),
});

export default function Forgot() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email, password } = values;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
        description: `Тавтай морил, ${data.user.email}`,
      });
      router.push('/');
    }
  };

  return (
    <div className='flex-grow grid justify-center bg-theme-img bg-center'>
      <div className='flex flex-col w-[380px] justify-center'>
        <Card className=' rounded-3xl shadow-sm shadow-primary'>
          <div className='flex items-center px-8 py-6 justify-center'>
            <Image
              src={logo}
              alt='Logo'
              sizes='10vw'
              // Make the image display full width
              style={{
                width: '50%',
                height: 'auto',
              }}
            />
          </div>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
                autoComplete='off'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className=' text-xs font-normal'>
                        Цахим шуудан
                      </FormLabel>
                      <FormControl>
                        <InputEmail
                          placeholder='И-мэйл оруулах'
                          {...field}
                          required
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
                      <FormLabel className=' text-xs font-normal'>
                        Нууц үг
                      </FormLabel>
                      <FormControl>
                        <InputPassword
                          placeholder='Нууц үг оруулах'
                          {...field}
                          required
                          type='password'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Checkbox className=' w-6 h-6' />
                    <label htmlFor='terms' className='text-sm font-bold'>
                      Намайг сана
                    </label>
                  </div>
                  <Link
                    href='/forgot'
                    className='text-sm font-bold underline text-primary-500'
                  >
                    Нууц үгээ мартсан?
                  </Link>
                </div>
                <Button type='submit' className='w-full py-2'>
                  Нэвтрэх
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
