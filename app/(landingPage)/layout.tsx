import { ReactNode } from 'react';
import { Navbar } from '../components/landingPage/Navbar';
import Footer from '../components/landingPage/Footer';

export default function StoreFrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </>
  );
}
