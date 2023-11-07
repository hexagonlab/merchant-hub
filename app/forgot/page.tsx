'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
  email: z.string().email({
    message: 'Формат буруу',
  }),
});

export default function Reset() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { email } = values;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.origin}/reset`,
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
        description:
          'Нууц үг сэргээх заавар илгээгдлээ. Та цахим шуудангаа шалгана уу!',
      });
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
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цахим шуудан</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='you@example.com'
                          {...field}
                          required
                          type='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit'>Сэргээх</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
