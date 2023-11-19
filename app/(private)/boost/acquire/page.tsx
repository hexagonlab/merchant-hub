'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useState } from 'react';
import { DatePicker } from '../retain/date-filter';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

type CustomerItem = {
  title: string;
  count: number;
};

type CouponData = {
  couponType?: string;
  couponPercent?: string;
  dueDate?: Date;
};

const customer_types: CustomerItem[] = [
  { title: 'Эрэгтэй', count: 1470000 },
  { title: 'Эмэгтэй', count: 1570000 },
  { title: 'Машинтай', count: 429000 },
  { title: 'Багш', count: 140000 },
  { title: 'Кофечин', count: 900000 },
  { title: 'Гэр бүлтэй', count: 1429000 },
  { title: 'Малчин', count: 300000 },
  { title: 'Амьтантай', count: 40000 },
];

function Page() {
  const [step, setStep] = useState(1);
  const [current, setCurrent] = useState<CustomerItem[]>([]);
  const [error, setError] = useState<string>();
  const [couponData, setData] = useState<CouponData>();
  const onChange = (value: string[]) => {
    console.log('hohoh' + value);
    const items = customer_types.filter((t) => value.includes(t.title));
    setCurrent(items);
  };

  const gotoNext = () => {
    if (step == 1 && !current) {
      setError('Сонгоно уу');
      return;
    } else if (step == 2 && !couponData) {
      setError('Сонгоно уу');
      return;
    }

    if (step == 2) {
      // TODO: dialog
    } else {
      setStep((c) => c + 1);
    }
  };

  const goBack = () => {
    if (step < 1) return;
    setStep((c) => c - 1);
  };

  const reset = () => {
    setStep(1);
    setCurrent([]);
    setData(undefined);
  };

  return (
    <div className='flex flex-col py-8 px-16 gap-y-4'>
      {step === 1 && <CustomerTypes current={current} onChange={onChange} />}
      {step === 2 && <Coupon onUpdate={setData} />}
      {error && <div className='text-destructive'>{error}</div>}
      {current ? (
        <div className='my-8'>
          <h3 className='text-3xl font-bold mb-4'>
            Хэрэглэгчийн тоо{' '}
            {current.reduce((a, b) => a + b.count, 0).toLocaleString()}
          </h3>
          {step === 1 ? (
            <p>
              Таны сонгосон дүрмээр{' '}
              {current.reduce((a, b) => a + b.count, 0).toLocaleString()} тооны
              хэрэглэгч дээр купон үүсгэх боломжтой байна.
            </p>
          ) : (
            <p>
              Нийт купоны дүн{' '}
              {(
                current.reduce((a, b) => a + b.count, 0) * 10000
              ).toLocaleString()}{' '}
              ₮ болж байна.
            </p>
          )}
        </div>
      ) : (
        <h3 className='text-3xl font-bold mb-4 my-8 '>
          Сегментээс сонгоогүй байна
        </h3>
      )}

      <div className='flex flex-1 justify-end gap-2'>
        <Button variant='outline' onClick={goBack}>
          Буцах
        </Button>
        {step == 2 ? (
          <ConfirmButton
            current={current}
            couponData={couponData}
            reset={reset}
          />
        ) : (
          <Button variant='default' onClick={gotoNext}>
            Үргэлжлүүлэх
          </Button>
        )}
      </div>
    </div>
  );
}

export default Page;

function CustomerTypes({
  current,
  onChange,
}: {
  current: CustomerItem[];
  onChange: (value: string[]) => void;
}) {
  return (
    <>
      <h3 className='text-lg font-bold'>Сегментээс сонгох</h3>
      <ToggleGroup
        type='multiple'
        variant='outline'
        onValueChange={onChange}
        defaultValue={current.map((x) => x.title)}
      >
        {customer_types.map((item, index) => (
          <ToggleGroupItem
            value={item.title}
            title={item.title}
            area-label={item.title}
            key={index}
          >
            {item.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </>
  );
}

const couponTypes = ['Дүнгээр', 'Хувиар'];

function Coupon({ onUpdate }: { onUpdate: (data: CouponData) => void }) {
  const [couponData, setCouponData] = useState<CouponData>({
    couponType: 'Дүнгээр',
  });

  const onChange = (value: string) => {
    setCouponData((d) => {
      onUpdate({
        ...d,
        couponType: value,
      });
      return { ...d, couponType: value };
    });
  };

  return (
    <>
      <label>Купоны хэлбэр</label>
      <Select onValueChange={onChange} defaultValue={couponData?.couponType}>
        <SelectTrigger>
          <SelectValue placeholder='Хэлбэр сонгох' />
        </SelectTrigger>

        <SelectContent className='max-h-60 overflow-auto'>
          {couponTypes.map((coupon) => (
            <SelectItem value={String(coupon)} key={coupon}>
              {coupon}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label>Хөнгөлөлт</label>
      <Input
        onChange={(value) =>
          setCouponData((d) => {
            onUpdate({
              ...d,
              couponPercent: value.currentTarget.value,
            });
            return {
              ...d,
              couponPercent: value.currentTarget.value,
            };
          })
        }
        value={couponData?.couponPercent}
      />
      <label>Хүчинтэй хугацаа</label>
      <DatePicker
        setCurrent={(val) => {
          setCouponData((d) => {
            onUpdate({
              ...d,
              dueDate: val,
            });
            return {
              ...d,
              dueDate: val,
            };
          });
        }}
      />
    </>
  );
}

function ConfirmButton({
  current,
  couponData,
  reset,
}: {
  current?: CustomerItem[];
  couponData?: CouponData;
  reset: () => void;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const onSubmit = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>Баталгаажуулах</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Хүсэлт баталгаажуулах</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Хүсэлтийн хэлбэр
            </Label>
            <span className='font-bold'>{couponData?.couponType}</span>
          </div>
          <div className='grid grid-cols-2 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Хөнгөлөлт
            </Label>
            <span className='font-bold'>{couponData?.couponPercent}</span>
          </div>
          <div className='grid grid-cols-2 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Хүчинтэй хугацаа
            </Label>
            <span className='font-bold'>
              {couponData?.dueDate && format(couponData.dueDate, 'yyyy.MM.dd')}{' '}
              хүртэл
            </span>
          </div>
        </div>
        {current ? (
          <div className='my-8 text-center'>
            <h3 className='text-xl font-bold mb-4'>
              Хэрэглэгчийн тоо{' '}
              {current.reduce((a, b) => a + b.count, 0).toLocaleString()}
            </h3>

            <p>
              Нийт купоны дүн{' '}
              {(
                current.reduce((a, b) => a + b.count, 0) * 10000
              ).toLocaleString()}{' '}
              ₮ болж байна.
            </p>
          </div>
        ) : (
          <></>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Буцах
          </Button>
          <Button type='submit' onClick={onSubmit}>
            Баталгаажуулах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
