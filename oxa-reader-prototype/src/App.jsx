import { useState, useEffect } from 'react'
import ArticlePage from './components/ArticlePage.jsx'

const ARTICLE_URL = `${import.meta.env.BASE_URL}2024.12.16.628638v2.json`
const ELIFE_DOI = '10.7554/eLife.105126'
const OPENALEX_URL = `https://api.openalex.org/works/https://doi.org/${ELIFE_DOI}?select=concepts,keywords,topics&mailto=c.huggins@elifesciences.org`

export default function App() {
  const [article, setArticle] = useState(null)
  const [concepts, setConcepts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch article content and OpenAlex concepts in parallel
    Promise.all([
      fetch(ARTICLE_URL).then(r => {
        if (!r.ok) throw new Error(`Article fetch failed: HTTP ${r.status}`)
        return r.json()
      }),
      fetch(OPENALEX_URL).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([articleData, alexData]) => {
      setArticle(articleData)

      if (alexData) {
        // Prefer keywords field; fall back to level 1–3 concepts scored > 0.4
        const kws = alexData.keywords?.map(k => k.display_name || k) || []
        const conceptKws = (alexData.concepts || [])
          .filter(c => c.level >= 1 && c.level <= 3 && c.score >= 0.4)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(c => c.display_name)
        setConcepts(kws.length > 0 ? kws.slice(0, 3) : conceptKws.slice(0, 3))
      }
    }).catch(err => setError(err.message))
  }, [])

  if (error) return <div className="loading">Failed to load article: {error}</div>
  if (!article) return <div className="loading">Loading…</div>

  return <ArticlePage article={article} concepts={concepts} />
}
