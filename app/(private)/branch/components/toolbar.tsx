'use client';

import CreateBranch from './create-branch';
import { StaticQR } from './staticQR';

type TProps = {
  branches: TBranch[];
  cities: TCity[];
  districts: TDistrict[];
  banks: TBank[];
  merchants: TMerchant[];
};

export default function Toolbar({
  cities,
  districts,
  merchants,
  banks,
  branches,
}: TProps) {
  return (
    <div className='my-6 flex justify-between items-center'>
      <div className='font-bold'>Салбарын жагсаалт</div>
      <div className='flex items-center gap-2'>
        <StaticQR branches={branches} />
        <CreateBranch
          cities={cities}
          districts={districts}
          merchants={merchants}
          banks={banks}
        />
      </div>
    </div>
  );
}
