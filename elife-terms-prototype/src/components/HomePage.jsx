import { useState, useMemo, useEffect, useRef } from 'react'
import ArticleCard from './ArticleCard.jsx'
import Nav from './Nav.jsx'
import { SearchIcon, ArrowRightIcon, CloseIcon, ChevronDownIcon, ChevronUpIcon } from './Icons.jsx'

const DEFAULT_SHOW = 6

const SIG_ORDER = ['Landmark', 'Fundamental', 'Important', 'Valuable', 'Useful']
const STR_ORDER = ['Exceptional', 'Compelling', 'Convincing', 'Solid', 'Incomplete']
const SIG_RANK  = { Landmark: 5, Fundamental: 4, Important: 3, Valuable: 2, Useful: 1 }
const STR_RANK  = { Exceptional: 5, Compelling: 4, Convincing: 3, Solid: 2, Incomplete: 1 }

function SearchBar({ value, onChange, onSubmit, onClear, showClear = false, size = 'hero' }) {
  const isNav = size === 'nav'
  const iconSize = isNav ? 12 : 16
  return (
    <div className={`search-bar search-bar--${size}`}>
      <div className="search-inner">
        <span className="search-icon"><SearchIcon size={24} /></span>
        <input
          className="search-input"
          type="text"
          placeholder="Search titles, keywords etc."
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
        />
      </div>
      {showClear ? (
        <button className={`search-btn search-btn--clear${isNav ? ' search-btn--sm' : ''}`} onClick={onClear} aria-label="Clear search">
          <CloseIcon size={iconSize} color="var(--color-grey-dark)" />
        </button>
      ) : (
        <button className={`search-btn${isNav ? ' search-btn--sm' : ''}`} onClick={onSubmit}>
          <ArrowRightIcon size={iconSize} color="white" />
        </button>
      )}
    </div>
  )
}

// Collapsible grey box — wraps any filter content
function FilterBox({ label, hasActive, onClear, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="filter-box">
      <button className="filter-box-header" onClick={() => setOpen(o => !o)}>
        <span className="filter-box-label">{label}</span>
        <span className="filter-box-actions">
          {hasActive && (
            <span
              className="filter-box-clear"
              onClick={e => { e.stopPropagation(); onClear?.() }}
            >Clear</span>
          )}
          {open ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </span>
      </button>
      {open && <div className="filter-box-body">{children}</div>}
    </div>
  )
}

// Checkbox multi-select filter
function FilterGroup({ label, items, active, onToggle, onClear, defaultShow = DEFAULT_SHOW }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, defaultShow)
  const hasMore = items.length > defaultShow

  return (
    <FilterBox label={label} hasActive={active.length > 0} onClear={onClear}>
      <div className="filter-divider" />
      {visible.map(({ name, count }) => {
        const isActive = active.includes(name)
        return (
          <div key={name} className={`filter-row${isActive ? ' active' : ''}`} onClick={() => onToggle(name)}>
            <span className="filter-row-label">{name}</span>
            <span className="filter-count">{count}</span>
            <span className={`checkbox${isActive ? ' checked' : ''}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        )
      })}
      {hasMore && (
        <button className="show-more-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less' : 'Show more'}
          {expanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </button>
      )}
    </FilterBox>
  )
}

// Radio single-select "minimum" filter
function RadioFilterGroup({ label, items, active, onSelect, onClear }) {
  return (
    <FilterBox label={label} hasActive={active !== null} onClear={onClear}>
      <div className="filter-divider" />
      {items.map(({ name, count }) => {
        const isActive = active === name
        return (
          <div key={name} className={`filter-row${isActive ? ' active' : ''}`} onClick={() => onSelect(isActive ? null : name)}>
            <span className="filter-row-label">{name}</span>
            <span className="filter-count">{count}</span>
            <span className={`radio${isActive ? ' checked' : ''}`} />
          </div>
        )
      })}
    </FilterBox>
  )
}

export default function HomePage({ papers, searchState }) {
  const { query, setQuery, committedQuery, setCommittedQuery, activeSubjects, setActiveSubjects, activeKeywords, setActiveKeywords } = searchState
  const [scrolled, setScrolled] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [minSignificance, setMinSignificance] = useState(null)
  const [minStrength, setMinStrength] = useState(null)
  const listingRef = useRef(null)

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setIsFiltering(true)
    const t = setTimeout(() => setIsFiltering(false), 500)
    return () => clearTimeout(t)
  }, [committedQuery, activeSubjects, activeKeywords, minSignificance, minStrength])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const subjects = useMemo(() => {
    const counts = {}
    papers.forEach(p => { counts[p.subfield] = (counts[p.subfield] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [papers])

  const keywords = useMemo(() => {
    const counts = {}
    papers.forEach(p => p.keywords.forEach(k => { counts[k.name] = (counts[k.name] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [papers])

  // Counts per exact term (for display in the filter rows)
  const sigCounts = useMemo(() => {
    const counts = {}
    papers.forEach(p => { if (p.assessmentSignificance) counts[p.assessmentSignificance] = (counts[p.assessmentSignificance] || 0) + 1 })
    return SIG_ORDER.map(name => ({ name, count: counts[name] || 0 }))
  }, [papers])

  const strCounts = useMemo(() => {
    const counts = {}
    papers.forEach(p => { if (p.assessmentStrength) counts[p.assessmentStrength] = (counts[p.assessmentStrength] || 0) + 1 })
    return STR_ORDER.map(name => ({ name, count: counts[name] || 0 }))
  }, [papers])

  const filtered = useMemo(() => {
    const q = committedQuery.toLowerCase().trim()
    const minSigRank = minSignificance ? SIG_RANK[minSignificance] : 0
    const minStrRank = minStrength ? STR_RANK[minStrength] : 0
    return papers.filter(p => {
      const matchesQ = !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.keywords.some(k => k.name.toLowerCase().includes(q)) ||
        p.topics.some(t => t.name.toLowerCase().includes(q))
      const matchesSub = activeSubjects.length === 0 || activeSubjects.includes(p.subfield)
      const matchesKw  = activeKeywords.length === 0 || activeKeywords.some(kw => p.keywords.some(k => k.name === kw))
      const matchesSig = minSigRank === 0 || (p.assessmentSignificance && SIG_RANK[p.assessmentSignificance] >= minSigRank)
      const matchesStr = minStrRank === 0 || (p.assessmentStrength && STR_RANK[p.assessmentStrength] >= minStrRank)
      return matchesQ && matchesSub && matchesKw && matchesSig && matchesStr
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [papers, committedQuery, activeSubjects, activeKeywords, minSignificance, minStrength])

  const scrollToListing = () => listingRef.current?.scrollIntoView({ behavior: 'smooth' })
  const handleSearch    = () => { setCommittedQuery(query); scrollToListing() }
  const handleNavSearch = () => setCommittedQuery(query)
  const handleClear     = () => { setQuery(''); setCommittedQuery('') }
  const showClear = committedQuery !== '' && query === committedQuery

  const toggleSubject = name => setActiveSubjects(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name])
  const toggleKeyword = name => setActiveKeywords(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name])

  const resetAll = () => {
    setQuery(''); setCommittedQuery('')
    setActiveSubjects([]); setActiveKeywords([])
    setMinSignificance(null); setMinStrength(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Sticky Nav ── */}
      <Nav scrolled={scrolled} onLogoClick={resetAll}>
        <div className="nav-search-wrap">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleNavSearch} onClear={handleClear} showClear={showClear} size="nav" />
        </div>
      </Nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-logo-placeholder">Logo placeholder</div>
        <div className="hero-search">
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} onClear={handleClear} showClear={showClear} size="hero" />
        </div>
        <button className="hero-browse" onClick={scrollToListing}>
          Or browse the latest research
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
        </button>
      </section>

      {/* ── Listing ── */}
      <div className="listing-page" ref={listingRef}>
        <div className="listing-inner">

          {/* Left filter sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-header-row">
              <span className="results-count"><span className="results-count-num">{filtered.length}</span> results</span>
              <span className="filter-header-dot">•</span>
              <span className="results-sort">Sort by: <span>{committedQuery ? 'Relevance' : 'Latest'}</span></span>
            </div>

            <FilterGroup
              label="Subjects"
              items={subjects}
              active={activeSubjects}
              onToggle={toggleSubject}
              onClear={() => setActiveSubjects([])}
            />
            <RadioFilterGroup
              label="Significance (minimum)"
              items={sigCounts}
              active={minSignificance}
              onSelect={setMinSignificance}
              onClear={() => setMinSignificance(null)}
            />
            <RadioFilterGroup
              label="Strength of evidence (minimum)"
              items={strCounts}
              active={minStrength}
              onSelect={setMinStrength}
              onClear={() => setMinStrength(null)}
            />
            <FilterGroup
              label="Keywords"
              items={keywords}
              active={activeKeywords}
              onToggle={toggleKeyword}
              onClear={() => setActiveKeywords([])}
            />
          </aside>

          {/* Results */}
          <div className="results-area">
            {isFiltering ? (
              <div className="results-spinner" aria-label="Loading results" />
            ) : filtered.length === 0 ? (
              <div className="no-results">
                <p>No articles match your search.</p>
                <button onClick={() => {
                  setCommittedQuery(''); setQuery('')
                  setActiveSubjects([]); setActiveKeywords([])
                  setMinSignificance(null); setMinStrength(null)
                }}>Clear filters</button>
              </div>
            ) : (
              <div className="article-list">
                {filtered.map(paper => <ArticleCard key={paper.id} paper={paper} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
