import { ArrowUpIcon } from './Icons.jsx'

export default function Nav({ scrolled = false, onLogoClick, noBorder = false, children }) {
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
              <span className="nav-logo" title="eLife Pathways">L</span>
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
