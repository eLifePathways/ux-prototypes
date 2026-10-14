import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const { pathname, search } = useLocation();

  // Start each page at the top, as a normal website would.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return (
    <div className="sc-page">
      <Header />
      <main className="sc-main">
        <Outlet />
      </main>
      <Footer />
      <div className="prototype-label">Prototype</div>
    </div>
  );
}
