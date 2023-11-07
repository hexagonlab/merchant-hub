import CreateBranch from './create-branch';
import CreateUser from './create-user';

type TProps = {
  branches: TBranch[];
  roles: TRole[];
  cities: TCity[];
  districts: TDistrict[];
  banks: TBank[];
  merchants: TMerchant[];
};

export default function AdminActions({
  branches,
  roles,
  merchants,
  banks,
  cities,
  districts,
}: TProps) {
  return (
    <div className='grid grid-cols-2 gap-4 border-t-2 py-6'>
      <CreateBranch
        merchants={merchants}
        banks={banks}
        cities={cities}
        districts={districts}
      />
      <CreateUser branches={branches} roles={roles} />
    </div>
  );
}
