import { useState, useEffect } from 'react'
import ArticlePage from './components/ArticlePage.jsx'

const ARTICLE_URL = `${import.meta.env.BASE_URL}2024.12.16.628638v2.json`
const CONCEPTS = ['Fear extinction', 'Reversal learning', 'Cue-context learning']

const VERSIONS = {
  1: { label: 'Version 1', date: '2025-02-27', doi: '10.7554/eLife.105126.1', status: 'Not yet revised since peer review' },
  2: { label: 'Version 2', date: '2025-10-29', doi: '10.7554/eLife.105126.2', status: 'Revised since peer review' },
  3: { label: 'Version 3', date: '2026-03-16', doi: '10.7554/eLife.105126.3', status: 'Declared as Version of Record' },
}

function getVersion() {
  const v = parseInt(new URLSearchParams(window.location.search).get('v'), 10)
  const version = VERSIONS[v] ? v : 3
  return { ...VERSIONS[version], _v: version }
}

export default function App() {
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)
  const versionConfig = getVersion()

  useEffect(() => {
    fetch(ARTICLE_URL).then(r => {
      if (!r.ok) throw new Error(`Article fetch failed: HTTP ${r.status}`)
      return r.json()
    }).then(setArticle).catch(err => setError(err.message))
  }, [])

  if (error) return <div className="loading">Failed to load article: {error}</div>
  if (!article) return <div className="loading">Loading…</div>

  return <ArticlePage article={article} concepts={CONCEPTS} versionConfig={versionConfig} />
}
