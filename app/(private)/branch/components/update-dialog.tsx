'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { handleUpdateBranch } from '@/app/(private)/dashboard/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CreateBranchSchema } from '@/lib/schema';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type TProps = {
  cities: TCity[];
  districts: TDistrict[];
  merchants: TMerchant[];
  banks: TBank[];
  state: {
    open: boolean;
    branch: TBranch | null;
  };
  setState: Dispatch<
    SetStateAction<{
      open: boolean;
      branch: TBranch | null;
    }>
  >;
};

export default function UpdateDialog({
  cities,
  districts: allDistrict,
  merchants,
  banks,
  state,
  setState,
}: TProps) {
  const { toast } = useToast();
  const [districts, setDistricts] = useState<TDistrict[]>(allDistrict);

  const form = useForm<z.infer<typeof CreateBranchSchema>>({
    resolver: zodResolver(CreateBranchSchema),
    defaultValues: {
      name: state.branch?.name || '',
      addr: state.branch?.addr || '',
      phone: state.branch?.phone || '',
      bank_account: state.branch?.bank_account || '',
      email: state.branch?.email || '',
      city: String(state.branch?.city_id) || '',
      district: String(state.branch?.district_id) || '',
      bank_code: state.branch?.bank_code || '',
      merchant_id: String(state.branch?.merchant_id) || '',
    },
    values: {
      name: state.branch?.name || '',
      addr: state.branch?.addr || '',
      phone: state.branch?.phone || '',
      bank_account: state.branch?.bank_account || '',
      email: state.branch?.email || '',
      city: String(state.branch?.city_id) || '',
      district: String(state.branch?.district_id) || '',
      bank_code: state.branch?.bank_code || '',
      merchant_id: String(state.branch?.merchant_id) || '',
    },
  });
  const watch = form.watch;

  const onSubmit = async (formData: z.infer<typeof CreateBranchSchema>) => {
    const { success, message } = await handleUpdateBranch(
      state.branch?.id as number,
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

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name == 'city') {
        console.log('city changed');
        const cityId = Number(value.city);

        const filteredDistricts = allDistrict.filter(
          (d) => d.city_id == cityId
        );

        form.resetField('district');

        setDistricts(filteredDistricts);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
          <DialogTitle>Салбарын бүртгэл засах</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-4 items-center'
          >
            <FormField
              control={form.control}
              name='merchant_id'
              render={({ field }) => (
                <FormItem className=' col-span-2'>
                  <FormLabel>Мерчант</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Мерчант сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {merchants.map((merchant) => (
                        <SelectItem
                          value={String(merchant.id)}
                          key={merchant.id}
                        >
                          {merchant.name}
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
              name='name'
              render={({ field }) => (
                <FormItem className=' col-span-2'>
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цахим шуудан</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Албан цахим шуудан'
                    />
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
            <Separator className=' col-span-2' />
            <div className='col-span-2 font-bold'>Хаяг, байршил</div>

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Хот</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Хот сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {cities.map((city) => (
                        <SelectItem value={String(city.id)} key={city.id}>
                          {city.name}
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
              name='district'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дүүрэг</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Хот сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {districts.map((district) => (
                        <SelectItem
                          value={String(district.id)}
                          key={district.id}
                        >
                          {district.name}
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
              name='addr'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Хаяг, байршил</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Хаяг байршил дэлгэрэнгүй бичих'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className=' col-span-2' />
            <div className='col-span-2 font-bold'>Банкны мэдээлэл</div>
            <FormField
              control={form.control}
              name='bank_code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Банк</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Банк сонгох' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-60 overflow-auto'>
                      {banks.map((bank) => (
                        <SelectItem value={String(bank.code)} key={bank.id}>
                          {bank.name_mn}
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
              name='bank_account'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дансны дугаар</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='Дансны дугаар бөглөх'
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
                Засах
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
