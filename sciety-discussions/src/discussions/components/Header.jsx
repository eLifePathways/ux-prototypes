import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { links, logOut, useSession } from '../../shared/store.js';
import { loginPath } from '../auth.js';
import LogoutModal from './LogoutModal.jsx';

export default function Header() {
  const { loggedIn } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirming, setConfirming] = useState(false);

  function handleLogOut() {
    setConfirming(false);
    logOut(); // wipes everything this tester did
    navigate('/');
  }

  return (
    <header className="ds-header">
      {/* Logo placeholder, as in the Figma designs */}
      <Link to="/" className="ds-logo">Discussions.sciety</Link>
      <nav className="ds-nav" aria-label="Main">
        <a href={links.scietyHome()}>Sciety</a>
        <NavLink to="/explore">Explore</NavLink>
        {loggedIn ? (
          <>
            <NavLink to="/profile">Profile</NavLink>
            <button type="button" onClick={() => setConfirming(true)}>Log out</button>
          </>
        ) : (
          <Link to={loginPath(location.pathname)}>Log in</Link>
        )}
      </nav>
      <LogoutModal open={confirming} onCancel={() => setConfirming(false)} onConfirm={handleLogOut} />
    </header>
  );
}
