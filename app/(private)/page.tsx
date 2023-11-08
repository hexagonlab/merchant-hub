import { fetchDataDashboard } from './dashboard/actions';
import AdminActions from './dashboard/components/admin-actions';
import Statistic from './dashboard/components/statistic';
import Sales from './dashboard/components/sales';
import Toolbar from './dashboard/components/toolbar';

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
    invoices,
  } = await fetchDataDashboard(searchParams);

  return (
    <div className='flex-grow px-6 xl:px-24 flex flex-col'>
      <div className='flex-grow'>
        <Toolbar branches={branches} isAdmin={isAdmin} />
        <Statistic data={statisticData} />
        <Sales branches={branches} sales={sales} invoices={invoices} />
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
