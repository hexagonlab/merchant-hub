'use client';

import CreateDialog from './create-dialog';

type TProps = {
  branches: TBranch[];
  cities: TCity[];
  districts: TDistrict[];
  banks: TBank[];
  merchants: TMerchant[];
  roles: TRole[];
};

export default function Toolbar({ roles, branches }: TProps) {
  return (
    <div className='my-6 flex justify-between items-center'>
      <div className='font-bold'>Ажилчдын жагсаалт</div>
      <div className='flex items-center gap-2'>
        <CreateDialog branches={branches} roles={roles} />
      </div>
    </div>
  );
}
