import { Link } from 'react-router-dom'
import { ArrowUpIcon, ArrowLeftIcon } from './Icons.jsx'

export default function Nav({ scrolled = false, onLogoClick, back, noBorder = false, children }) {
  return (
    <div className="nav-spacer">
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''} ${noBorder ? 'no-border' : ''}`}>
      <div className="nav-inner">
        <div className="nav-col1">
          {onLogoClick ? (
            <button className="nav-logo" onClick={onLogoClick} title="Back to top">
              {scrolled ? <ArrowUpIcon size={14} /> : 'L'}
            </button>
          ) : (
            <Link className="nav-logo" to="/" title="Back to home">L</Link>
          )}
          {back && (
            <button className="nav-back" onClick={back} title="Back to results">
              <ArrowLeftIcon size={14} />
            </button>
          )}
        </div>

        {children}

        <div className="nav-links">
          <a href="https://elifepathways.github.io/ux-prototypes/">Home</a>
            <a href="#">About</a>
        </div>
      </div>
    </nav>
    </div>
  )
}
