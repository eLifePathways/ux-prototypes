import { useNavigate } from 'react-router-dom'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function displayVersion(v) {
  if (v === 'v1') return 'Version 1'
  if (v === 'v2') return 'Version 2'
  return v
}

function canonicalDoi(doi) {
  if (!doi) return doi
  return doi.replace(/elife\./i, 'eLife.').replace(/\.\d+$/, '')
}

// Higher rank = more dots. Landmark/Exceptional = 5 dots, Useful/Incomplete = 1 dot.
const SIG_DOTS = { Landmark: 5, Fundamental: 4, Important: 3, Valuable: 2, Useful: 1 }
const STR_DOTS = { Exceptional: 5, Compelling: 4, Convincing: 3, Solid: 2, Incomplete: 1 }

export default function ArticleCard({ paper }) {
  const navigate = useNavigate()
  const doi = canonicalDoi(paper.doi)
  const sig = paper.assessmentSignificance
  const str = paper.assessmentStrength
  const sigDots = sig ? '•'.repeat(SIG_DOTS[sig] ?? 3) : null
  const strDots = str ? '•'.repeat(STR_DOTS[str] ?? 3) : null
  const keywordList = paper.keywords.slice(0, 3).map(k => k.name)

  return (
    <article className="article-card" onClick={() => navigate(`/article/${paper.id}`)}>
      <div className="card-inner">

        {/* Left content column */}
        <div className="card-content">
          <h2 className="card-title">{paper.title}</h2>
          {paper.assessmentSummary && (
            <div
              className="card-summary"
              dangerouslySetInnerHTML={{ __html: paper.assessmentSummary }}
            />
          )}
          <p className="card-authors">{paper.authors}</p>
          <div className="card-meta-line">
            <span>{formatDate(paper.date)}</span>
            <span className="card-meta-dot">•</span>
            <span>{displayVersion(paper.version)}</span>
            <span className="card-meta-dot">•</span>
            <a
              className="card-meta-doi"
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              https://doi.org/{doi}
            </a>
          </div>
        </div>

        {/* Right metadata column */}
        <div className="card-meta">
          <span className="card-subject">{paper.subfield}</span>
          {(sig || str) && (
            <div className="card-terms">
              {sig && (
                <span className="card-term">
                  {sig} <span className="card-term-dots">{sigDots}</span>
                </span>
              )}
              {str && (
                <span className="card-term">
                  {str} <span className="card-term-dots">{strDots}</span>
                </span>
              )}
            </div>
          )}
          {keywordList.length > 0 && (
            <ul className="card-keyword-list">
              {keywordList.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </article>
  )
}
