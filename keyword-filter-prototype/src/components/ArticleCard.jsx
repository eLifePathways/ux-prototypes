import { useNavigate } from 'react-router-dom'

const SUMMARY = 'This is a valuable study on the metabolic adaptations upon succinate dehydrogenase loss in cancer cells. If confirmed, this study will offer some therapeutic vulnerabilities in treating SDH-deficient cancer. However, the evidence supporting the authors\' claim is incomplete and would benefit from additional experimental evidence. This study will be of broad interest for cancer biologists focusing on metabolism.'

function formatDate(iso) {
  const [year, month, day] = iso.split('-')
  const d = new Date(Date.UTC(+year, +month - 1, +day))
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function formatDoi(doi, date) {
  return `https://doi.org/${doi}.${date.replace(/-/g, '.')}`
}

function displayDoi(date) {
  return `https://doi.org/10.xxxx/xxxxxxxx.${date.replace(/-/g, '.')}`
}

export default function ArticleCard({ paper }) {
  const navigate = useNavigate()
  const subjectTags = [paper.subfield]
  const keywordTags = paper.keywords.slice(0, 5).map(k => k.name)

  return (
    <article className="article-card" onClick={() => navigate(`/article/${paper.id}`)}>

      <div className="card-header">
        <h2 className="card-title">{paper.title}</h2>
        <p className="card-authors">{paper.authors}</p>
        <div className="card-meta-line">
          <span>{formatDate(paper.date)}</span>
          <span className="card-meta-dot">•</span>
          <span>Version 1</span>
          <span className="card-meta-dot">•</span>
          <a
            className="card-meta-doi"
            href={formatDoi(paper.doi, paper.date)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {displayDoi(paper.date)}
          </a>
        </div>
      </div>

      <div className="card-body">
        <div className="card-tags">
          {subjectTags.map(name => (
            <span key={name} className="tag tag--subject">{name}</span>
          ))}
          {keywordTags.map(name => (
            <span key={name} className="tag tag--keyword">{name}</span>
          ))}
        </div>
        <div className="card-summary">{SUMMARY}</div>
      </div>

    </article>
  )
}
