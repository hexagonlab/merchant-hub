import Footer from '@/components/footer';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-screen flex flex-col'>
      {children}
      <Footer />
    </div>
  );
}
