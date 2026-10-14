import { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from './SearchIcon.jsx';

const LOGO = `${import.meta.env.BASE_URL}sciety-logo.svg`;

function Logo() {
  const [missing, setMissing] = useState(false);
  if (missing) return <span className="sc-logo__fallback">sciety</span>;
  return <img className="sc-logo__img" src={LOGO} alt="Sciety" onError={() => setMissing(true)} />;
}

export default function Header() {
  return (
    <header className="sc-header">
      <div className="sc-header__left">
        <Link to="/" className="sc-logo" aria-label="Sciety home">
          <Logo />
        </Link>
      </div>

      {/* Search is a visual placeholder in this prototype: it does nothing. */}
      <form className="sc-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <SearchIcon />
        <label htmlFor="sc-search-input" className="visually-hidden">Search</label>
        <input id="sc-search-input" className="sc-search__input" type="search" placeholder="Search" autoComplete="off" />
      </form>

      <nav className="sc-header__right" aria-label="Main">
        <Link to="/" className="sc-nav-link">Home</Link>
        <a href="#" className="sc-nav-link" onClick={(e) => e.preventDefault()}>About</a>
      </nav>
    </header>
  );
}
