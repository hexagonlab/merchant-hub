import { fetchDataEmployee } from '../dashboard/actions';
import Toolbar from './components/toolbar';
import EmployeeList from './components/employee-list';

export default async function Index() {
  const { branches, cities, banks, districts, merchants, roles, users } =
    await fetchDataEmployee();

  return (
    <div className='flex-grow px-6 xl:px-24'>
      <Toolbar
        branches={branches}
        cities={cities}
        districts={districts}
        banks={banks}
        merchants={merchants}
        roles={roles}
      />
      <EmployeeList employees={users} branches={branches} roles={roles} />
    </div>
  );
}
