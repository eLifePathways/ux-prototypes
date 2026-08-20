import { useState, useMemo, useEffect, useRef } from 'react'
import ArticleCard from './ArticleCard.jsx'
import Nav from './Nav.jsx'
import { SearchIcon, ArrowRightIcon, CloseIcon, ChevronDownIcon, ChevronUpIcon } from './Icons.jsx'

const SUMMARY = 'This is a valuable study on the metabolic adaptations upon succinate dehydrogenase loss in cancer cells. If confirmed, this study will offer some therapeutic vulnerabilities in treating SDH-deficient cancer. However, the evidence supporting the authors\' claim is incomplete and would benefit from additional experimental evidence. This study will be of broad interest for cancer biologists focusing on metabolism.'

const DEFAULT_SHOW = 6

function SearchBar({ value, onChange, onSubmit, onClear, showClear = false, size = 'hero' }) {
  const isNav = size === 'nav'
  const iconSize = isNav ? 12 : 16
  return (
    <div className={`search-bar search-bar--${size}`}>
      <div className="search-inner">
        <span className="search-icon">
          <SearchIcon size={24} />
        </span>
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

function FilterGroup({ label, items, active, onToggle, defaultShow = DEFAULT_SHOW }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, defaultShow)
  const hasMore = items.length > defaultShow

  return (
    <div className="filter-group">
      <div className="filter-group-label">{label}</div>
      <div className="filter-divider" />
      {visible.map(({ name, count }) => {
        const isActive = active.includes(name)
        return (
          <div
            key={name}
            className={`filter-row ${isActive ? 'active' : ''}`}
            onClick={() => onToggle(name)}
          >
            <span className="filter-row-label">{name}</span>
            <span className="filter-count">{count}</span>
            <span className={`checkbox ${isActive ? 'checked' : ''}`}>
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
    </div>
  )
}

export default function HomePage({ papers, searchState }) {
  const { query, setQuery, committedQuery, setCommittedQuery, activeSubjects, setActiveSubjects, activeKeywords, setActiveKeywords } = searchState
  const [scrolled, setScrolled] = useState(false)
  const listingRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Subject options = top-level subfield per paper
  const subjects = useMemo(() => {
    const counts = {}
    papers.forEach(p => { counts[p.subfield] = (counts[p.subfield] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [papers])

  // Keyword options
  const keywords = useMemo(() => {
    const counts = {}
    papers.forEach(p => p.keywords.forEach(k => { counts[k.name] = (counts[k.name] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [papers])

  const filtered = useMemo(() => {
    const q = committedQuery.toLowerCase().trim()
    return papers.filter(p => {
      const matchesQ = !q ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.keywords.some(k => k.name.toLowerCase().includes(q)) ||
        p.topics.some(t => t.name.toLowerCase().includes(q))
      const matchesSub = activeSubjects.length === 0 || activeSubjects.includes(p.subfield)
      const matchesKw = activeKeywords.length === 0 ||
        activeKeywords.some(kw => p.keywords.some(k => k.name === kw))
      return matchesQ && matchesSub && matchesKw
    })
  }, [papers, committedQuery, activeSubjects, activeKeywords])

  const scrollToListing = () => {
    listingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSearch = () => {
    setCommittedQuery(query)
    scrollToListing()
  }

  const handleNavSearch = () => {
    setCommittedQuery(query)
  }

  const handleClear = () => {
    setQuery('')
    setCommittedQuery('')
  }

  // Show clear button when a search has been committed and user hasn't edited since
  const showClear = committedQuery !== '' && query === committedQuery

  const toggleSubject = name => setActiveSubjects(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name])
  const toggleKeyword = name => setActiveKeywords(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name])

  const resetAll = () => {
    setQuery('')
    setCommittedQuery('')
    setActiveSubjects([])
    setActiveKeywords([])
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
          {/* Sidebar */}
          <aside className="filter-sidebar">
            <span className="results-count">{filtered.length} results</span>
            <FilterGroup
              label="Narrow by keyword:"
              items={keywords}
              active={activeKeywords}
              onToggle={toggleKeyword}
            />
          </aside>

          {/* Results */}
          <div className="results-area">
            {filtered.length === 0 ? (
              <div className="no-results">
                <p>No articles match your search.</p>
                <button onClick={() => { setCommittedQuery(''); setQuery(''); setActiveSubjects([]); setActiveKeywords([]) }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="article-list">
                {filtered.map(paper => (
                  <ArticleCard
                    key={paper.id}
                    paper={paper}
                  />
                ))}
              </div>
            )}
          </div>

          <span className="results-sort">Sort by: <span>Latest</span></span>
        </div>
      </div>
    </>
  )
}
