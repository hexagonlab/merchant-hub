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
import logo from '../../../public/logo-light.png';

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
import { CreateStaticQRSchema } from '@/lib/schema';
import { handleCreateStaticQR } from '../../dashboard/actions';
import { InputItem } from '@/components/ui/input-item';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

type TProps = {
  branches: TBranch[];
};

export function StaticQR({ branches }: TProps) {
  const { SVG } = useQRCode();
  const { toast } = useToast();
  const [isQRCodeGenerated, setIsQRCodeGenerated] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof CreateStaticQRSchema>>({
    resolver: zodResolver(CreateStaticQRSchema),
    defaultValues: {
      item: '',
    },
  });
  const watch = form.watch;
  const watchItem = watch('item');
  const watchBranch = watch('branch_id');

  const onSubmit = async (formData: z.infer<typeof CreateStaticQRSchema>) => {
    const { success, message, data } = await handleCreateStaticQR(formData);

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

  const download = () => {
    const doc = new jsPDF();
    const element = document.querySelector(
      '#qr-container > div:nth-child(3) > svg'
    );

    if (element) {
      const bName =
        branches.find((x) => x.id === Number(watchBranch))?.name || 'branch';
      doc
        .svg(element, {
          x: 5,
          y: 0,
          width: 200,
          height: 200,
        })
        .then(() => {
          // save the created pdf
          doc.save(`${bName}-qrcode.pdf`);
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange()}>
      <DialogTrigger asChild>
        <Button className=' bg-gradient-to-r from-primary-500 to-primary-900 font-bold rounded-lg cursor-pointer'>
          <LucideQrCode className='h-4 w-4 mr-2' />
          Хэвлэх QR үүсгэх
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[560px] max-h-screen overflow-scroll'>
        <DialogHeader className=' mb-3'>
          <DialogTitle className='font-bold'>Хэвлэх QR үүсгэх</DialogTitle>
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
              <div className='flex flex-col items-center mt-4'>
                <div className='block text-center mb-4'>
                  <p className='text-primary-500 font-bold'>
                    Бодитоор хэвлэгдэх загвар
                  </p>
                  <p className='text-xs'>
                    Хэвлэгдэхэд хамгийн зөв файл болох PDF өргөтгөлөөр
                    татагдана.
                  </p>
                </div>
                <div
                  id='qr-container'
                  className='border-2 border-dashed border-primary-100 flex flex-col items-center'
                >
                  <div className='flex items-center pt-6 justify-center'>
                    <Image
                      src={logo}
                      alt='Logo'
                      sizes='100%'
                      // Make the image display full width
                      style={{
                        width: '100%',
                        height: 'auto',
                      }}
                    />
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
              ) : (
                <Button
                  type='button'
                  className='font-bold'
                  onClick={() => download()}
                >
                  Файл татах
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
