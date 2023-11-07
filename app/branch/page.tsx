import { fetchDataBranch } from '../dashboard/actions';
import Toolbar from './components/toolbar';
import BranchList from './components/branch-list';

export default async function Index() {
  const { branches, cities, banks, districts, merchants } =
    await fetchDataBranch();

  return (
    <div className='flex-grow px-6 xl:px-24'>
      <Toolbar
        branches={branches}
        cities={cities}
        districts={districts}
        banks={banks}
        merchants={merchants}
      />
      <BranchList
        branches={branches}
        cities={cities}
        districts={districts}
        merchants={merchants}
        banks={banks}
      />
    </div>
  );
}
