import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useLayoutEffect } from 'react'
import HomePage from './components/HomePage.jsx'
import ArticlePage from './components/ArticlePage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)

  // Search/filter state lifted here so it survives navigation to article pages
  const [query, setQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [activeSubjects, setActiveSubjects] = useState([])
  const [activeKeywords, setActiveKeywords] = useState([])

  useEffect(() => {
    fetch('./papers.json')
      .then(r => r.json())
      .then(data => {
        setPapers(data.filter(p => p.assessmentSignificance && p.assessmentSummary))
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading papers…</div>

  const searchState = { query, setQuery, committedQuery, setCommittedQuery, activeSubjects, setActiveSubjects, activeKeywords, setActiveKeywords }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage papers={papers} searchState={searchState} />} />
        <Route path="/article/:id" element={<ArticlePage papers={papers} />} />
      </Routes>
    </>
  )
}
