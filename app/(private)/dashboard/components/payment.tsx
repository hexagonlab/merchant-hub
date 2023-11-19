'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useRef, useState } from 'react';
import { fetchWave, payInvoice } from '../actions';

type TPaymentInvoice =
  Database['public']['Tables']['payment_invoices']['Insert'];

export type InvoiceProps = {
  invoices: TInvoice[];
  branches: TBranch[];
  play: (data: string) => void;
};

export default function PaymentButton({
  invoices,
  branches,
  play,
}: InvoiceProps) {
  const [selected, setSelected] = useState<TInvoice | undefined>();
  const [open, setOpen] = useState(false);
  const [speech, setSpeech] = useState<string>('2000 paid');
  const { toast } = useToast();

  const convertToAudio = async () => {
    if (speech) {
      const result = await fetchWave(speech);
      console.log(result);
      play(result);
    } else {
      console.log('сонгоогүй байна.');
    }
  };

  const onPay = async () => {
    console.log('paid');
    if (!selected) {
      toast({
        title: 'Анхааруулга',
        description: 'Invoice сонгоно уу',
      });

      return;
    }

    const branch = branches.find((x) => x.id === selected.merchant_branch_id)!!;

    const paid: TPaymentInvoice = {
      amount: selected.amount,
      merchant_branch_id: selected.merchant_branch_id,
      buyer_fname: 'hohh',
      buyer_id_number: 're32323232',
      buyer_lname: 'asdasdasd',
      buyer_phone: '88034340',
      fee_amount: 50,
      qr_type: selected.qr_type,
      qr_data: selected.qr_data,
      status: 'CONFIRMED',
      acquirer_amount: 10,
      issuer_amount: 10,
      base_fee_amount: 10,
      merchant_amount: 10,
      product_id: selected.product_id,
      invoice_id: selected.id,
      merchant_id: branch?.merchant_id,
    };

    const payment = await payInvoice(paid);

    if (payment.success) {
      await convertToAudio();
      toast({
        title: 'Амжилттай',
        description: 'Амжилттай',
      });
    } else {
      toast({
        title: 'Амжилттай',
        description: payment.message,
      });
    }

    // const synth = window.speechSynthesis;

    // if (utterance) {
    //   console.log('starting');

    //   synth.speak(utterance);
    // }

    setOpen(false);
  };

  return (
    <>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button className=' bg-gradient-to-r from-primary-500 to-primary-900 font-bold rounded-lg cursor-pointer'>
            Төлөх
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[560px] max-h-screen overflow-scroll'>
          <DialogHeader className=' mb-3'>
            <DialogTitle className='font-bold'>QR үүсгэх</DialogTitle>
          </DialogHeader>
          <RadioGroup
            onValueChange={(t) => {
              const invoice = invoices.find((x) => x.id == Number(t));
              setSelected(invoice);
              setSpeech(`${invoice?.amount} төгрөг амжилттай төлөгдлөө`);
            }}
            defaultValue={selected?.id.toString()}
            className='flex flex-col space-y-1'
          >
            {invoices.map((item) => (
              // eslint-disable-next-line react/jsx-key
              <FormItem
                className='flex items-center space-x-3 space-y-0'
                key={item.id}
              >
                <RadioGroupItem value={item.id.toString()} />
                <Label className='font-normal'>
                  {`Дүн: ${item.amount?.toLocaleString()} ₮`} - {item.qr_type} -{' '}
                  {item.status}
                </Label>
              </FormItem>
            ))}
          </RadioGroup>

          <div className='flex justify-end items-center gap-2'>
            <DialogClose asChild>
              <Button type='button' variant='outline' className='font-bold'>
                Хаах
              </Button>
            </DialogClose>

            <Button type='button' className='font-bold' onClick={onPay}>
              Төлөх
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
