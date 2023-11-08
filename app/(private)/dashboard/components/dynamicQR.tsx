'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useQRCode } from 'next-qrcode';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Building, LucideQrCode } from 'lucide-react';
import { CreateDynamicQRSchema } from '@/lib/schema';
import { handleCreateDynamicQR } from '../actions';
import { InputAmount } from '@/components/ui/input-amount';
import { InputItem } from '@/components/ui/input-item';
import { useState } from 'react';

type TProps = {
  branches: TBranch[];
};

export function DynamicQR({ branches }: TProps) {
  const { SVG } = useQRCode();
  const { toast } = useToast();
  const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof CreateDynamicQRSchema>>({
    resolver: zodResolver(CreateDynamicQRSchema),
    defaultValues: {
      item: '',
      amount: '',
    },
  });
  const watch = form.watch;
  const watchItem = watch('item');

  const onSubmit = async (formData: z.infer<typeof CreateDynamicQRSchema>) => {
    console.log(formData);
    const { success, message, data } = await handleCreateDynamicQR(formData);

    if (success && data) {
      setQrData(data.qr_data);
      toast({
        title: 'Амжилттай',
        description: message as string,
      });

      // show QR
      setIsQRCodeGenerated(true);
    } else {
      toast({
        title: 'Алдаа гарлаа',
        description: message?.toString(),
      });
    }
  };

  const onOpenChange = () => {
    setIsQRCodeGenerated(false);
    form.reset();
    setOpen(!open);
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange()}>
      <DialogTrigger asChild>
        <Button className=' bg-gradient-to-r from-primary-500 to-primary-900 font-bold rounded-lg cursor-pointer'>
          <LucideQrCode className='h-4 w-4 mr-2' />
          QR үүсгэх
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[560px] max-h-screen overflow-scroll'>
        <DialogHeader className=' mb-3'>
          <DialogTitle className='font-bold'>QR үүсгэх</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 items-center'
          >
            {!isQRCodeGenerated ? (
              <>
                <FormField
                  control={form.control}
                  name='branch_id'
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <div className='flex gap-2 items-center'>
                              <Building className='h-4 w-4 text-primary-500' />
                              <SelectValue placeholder='Салбар сонгох' />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='max-h-60 overflow-auto'>
                          {branches.map((branch) => (
                            <SelectItem
                              value={String(branch.id)}
                              key={branch.id}
                            >
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
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputAmount
                          {...field}
                          placeholder='Мөнгөн дүн'
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <FormField
              control={form.control}
              name='item'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputItem {...field} placeholder='Барааны нэр' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isQRCodeGenerated ? (
              <div className='grid place-content-center mt-4'>
                <div className='border-2 border-dashed border-primary-100 flex flex-col items-center'>
                  <div className='flex items-center pt-6 justify-center text-2xl font-bold'>
                    <span className='text-primary-500'>MERCHANT</span>
                    <span>&nbsp;HUB</span>
                  </div>
                  <div className='text-xs font-bold text-center whitespace-pre-wrap mt-4 max-w-[152px]'>
                    {watchItem}
                  </div>
                  <SVG
                    text={qrData as string}
                    options={{
                      margin: 4,
                      width: 200,
                      color: {
                        dark: '#1F2937',
                        light: '#FFFFFF',
                      },
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div className='flex justify-end items-center gap-2'>
              <DialogClose asChild>
                <Button type='button' variant='outline' className='font-bold'>
                  {isQRCodeGenerated ? 'Хаах' : 'Цуцлах'}
                </Button>
              </DialogClose>
              {!isQRCodeGenerated ? (
                <Button type='submit' className='font-bold'>
                  Бүртгэх
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
