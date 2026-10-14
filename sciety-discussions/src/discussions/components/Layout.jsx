import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from '../../shared/Footer.jsx';
import Toast from './Toast.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="ds-page">
      <Header />
      <main className="ds-main">
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <div className="prototype-label">Prototype</div>
    </div>
  );
}
