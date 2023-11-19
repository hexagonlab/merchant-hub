'use client';
import { useRef, useState } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { DynamicQR } from './dynamicQR';
import PaymentButton from './payment';

type TProps = {
  branches: TBranch[];
  sales: TSale[];
  invoices: TInvoice[];
};

export default function Sales({ branches, sales, invoices }: TProps) {
  const [audio, setAudio] = useState<string>('');
  const audioPlayer = useRef<HTMLAudioElement>(null);

  const play = (result: string) => {
    setAudio(result);
    setTimeout(() => {
      if (audioPlayer.current) {
        audioPlayer.current.load();
        audioPlayer.current.play();
        console.log('played', audioPlayer.current);
      }
    }, 800);
  };

  return (
    <div className='mt-6'>
      <div className='flex justify-between'>
        <div className='font-bold'>Борлуулалтын жагсаалт</div>
        <div className='flex gap-2'>
          <DynamicQR branches={branches} />

          <PaymentButton invoices={invoices} branches={branches} play={play} />
        </div>
      </div>
      <div className='my-6'>
        <DataTable columns={columns} data={sales} />

        <audio ref={audioPlayer}>
          <source src={audio} type='audio/wav' />
          Your browser does not support the audio tag.
        </audio>
      </div>
    </div>
  );
}
