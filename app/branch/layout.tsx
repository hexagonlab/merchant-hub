import Footer from '@/components/footer';
import NavBar from '@/components/nav-bar';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-screen flex flex-col'>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}
