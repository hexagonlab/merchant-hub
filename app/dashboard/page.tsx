import { fetchDataDashboard } from './actions';
import AdminActions from './components/admin-actions';
import Statistic from './components/statistic';
import Sales from './components/sales';
import Toolbar from './components/toolbar';

type TProps = {
  searchParams: TSearchParams;
};

export default async function Index({ searchParams }: TProps) {
  const {
    branches,
    roles,
    merchants,
    banks,
    cities,
    districts,
    isAdmin,
    sales,
    statisticData,
  } = await fetchDataDashboard(searchParams);

  return (
    <div className='flex-grow px-6 xl:px-24 flex flex-col'>
      <div className='flex-grow'>
        <Toolbar branches={branches} isAdmin={isAdmin} />
        <Statistic data={statisticData} />
        <Sales branches={branches} sales={sales} />
      </div>

      {isAdmin ? (
        <AdminActions
          branches={branches}
          roles={roles}
          merchants={merchants}
          banks={banks}
          cities={cities}
          districts={districts}
        />
      ) : null}
    </div>
  );
}
