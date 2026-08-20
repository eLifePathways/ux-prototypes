import { useParams, useNavigate } from 'react-router-dom'
import Nav from './Nav.jsx'
import { useState, useRef, useEffect } from 'react'
import { CaretDownIcon, CaretUpIcon, CheckIcon, DownloadIcon, QuoteIcon } from './Icons.jsx'

const SUMMARY = 'This is a valuable study on the metabolic adaptations upon succinate dehydrogenase loss in cancer cells. If confirmed, this study will offer some therapeutic vulnerabilities in treating SDH-deficient cancer. However, the evidence supporting the authors\' claim is incomplete and would benefit from additional experimental evidence. This study will be of broad interest for cancer biologists focusing on metabolism.'

const ABSTRACT_PLACEHOLDER = 'In skeletal muscle, muscle stem cells (MuSC) are the main cells responsible for regeneration upon injury. In diseased skeletal muscle, it would be therapeutically advantageous to replace defective MuSCs, or rejuvenate them with drugs to enhance their self-renewal and ensure long-term regenerative potential. One limitation of the replacement approach has been the inability to efficiently expand MuSCs ex vivo, while maintaining their stemness and engraftment abilities. Herein, we show that inhibition of type I protein arginine methyltransferases (PRMTs) with MS023 increases the proliferative capacity of ex vivo cultured MuSCs.'

const INTRO_PLACEHOLDER = 'As research in this field evolves, variants may emerge that increase our understanding of the underlying mechanisms. Quantifying the observed effects allows us to better understand biological differences between cell populations [1]. Analysing genomic data from patient samples is a key challenge in modern biology, particularly when applying phylodynamic methods to complex datasets.'

// Assign institution numbers across 4 placeholder institutions
const INST_PATTERN = [1, 2, 2, 1, 3, 3, 4, 4, 2, 1, 3, 4, 1, 2, 3, 4]
function instNum(idx) { return INST_PATTERN[idx % INST_PATTERN.length] }

const INSTITUTIONS = [
  '[placeholder institution name 1]',
  '[placeholder institution name 2]',
  '[placeholder institution name 3]',
  '[placeholder institution name 4]',
]

const SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: 'Introduction' },
  { id: 'results', label: 'Results' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'methods', label: 'Materials and methods' },
  { id: 'data', label: 'Data availability' },
  { id: 'references', label: 'References' },
  { id: 'info', label: 'Article and author information' },
  { id: 'metrics', label: 'Metrics' },
]


export default function ArticlePage({ papers }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [activeSection, setActiveSection] = useState('abstract')
  const [scrolled, setScrolled] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const paper = papers.find(p => p.id === id)

  if (!paper) return (
    <div style={{ padding: '80px 24px' }}>
      <button onClick={() => navigate('/')}>← Back</button>
      <p style={{ marginTop: 16, color: '#64748b' }}>Article not found.</p>
    </div>
  )

  return (
    <div className="article-page">
      <Nav scrolled={true} noBorder back={() => navigate(-1)} onLogoClick={scrolled ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : null} />

      <div className="article-page-inner">
        {/* ── Main left column ── */}
        <div className="article-main">
          <div className="article-header">
            <div className="card-tags article-tags">
              <span className="tag tag--subject">{paper.subfield}</span>
              {paper.keywords.slice(0, 5).map(kw => (
                <span key={kw.name} className="tag tag--keyword">{kw.name}</span>
              ))}
            </div>

            <h1 className="article-title">{paper.title}</h1>

            {(() => {
              const authorList = paper.authors.split(', ')
              return showDetails ? (
                <ul className="author-list-expanded">
                  {authorList.map((name, i) => (
                    <li key={i}>
                      {i === 0 ? `${name}*` : name}<sup>{instNum(i)}</sup>{i < authorList.length - 1 ? ',' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="article-authors">
                  {authorList.map((name, i) => (
                    <span key={i}>
                      {i === 0 ? `${name}*` : name}<sup>{instNum(i)}</sup>{i < authorList.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )
            })()}

            {showDetails && (
              <>
                <p className="author-correspondence">*For correspondence: placeholdername@email.com</p>
                <ol className="institution-list">
                  {INSTITUTIONS.map((inst, i) => <li key={i}>{inst}</li>)}
                </ol>
              </>
            )}

            <p className="article-doi">
              <a href={`https://doi.org/${paper.doi}.${paper.date.replace(/-/g, '.')}`} target="_blank" rel="noopener noreferrer">
                {`https://doi.org/10.xxxx/xxxxxxxx.${paper.date.replace(/-/g, '.')}`}
              </a>
            </p>

            <button className="show-more-details" onClick={() => setShowDetails(s => !s)}>
              {showDetails ? 'Show less' : 'Show more details'}
              {showDetails ? <CaretUpIcon size={10} /> : <CaretDownIcon size={10} />}
            </button>
          </div>

          <div className="article-summary-box">{SUMMARY}</div>

          {/* Article body: section nav + content */}
          <div className="article-body">
            <nav className="section-nav">
              {SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? 'active' : ''}
                  onClick={() => setActiveSection(s.id)}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="article-content">
              <section id="abstract">
                <h2>Abstract</h2>
                <p>{ABSTRACT_PLACEHOLDER}</p>
              </section>

              <section id="introduction">
                <h2>Introduction</h2>
                <p>{INTRO_PLACEHOLDER}</p>
                <p>Further investigation into the molecular mechanisms underlying these observations will be essential for developing targeted therapeutic strategies. The current study presents a comprehensive analysis of the relevant signalling pathways and their downstream effectors.</p>
              </section>

              <section id="results">
                <h2>Results</h2>
                <p>[Results placeholder — full article available via eLife.]</p>
              </section>

              <section id="discussion">
                <h2>Discussion</h2>
                <p>[Discussion placeholder — full article available via eLife.]</p>
              </section>

              <section id="methods">
                <h2>Materials and methods</h2>
                <p>[Methods placeholder — full article available via eLife.]</p>
              </section>

              <section id="data">
                <h2>Data availability</h2>
                <p>Data associated with this article are available via the linked eLife article page.</p>
              </section>

              <section id="references">
                <h2>References</h2>
                <p>[References placeholder — full article available via eLife.]</p>
              </section>

              <section id="info">
                <h2>Article and author information</h2>
                <p><strong>Authors:</strong> {paper.authors}</p>
                <p><strong>Published:</strong> {paper.date}</p>
              </section>

              <section id="metrics">
                <h2>Metrics</h2>
                <p>Views: 6,746 · Downloads: 5,128 · Citations: 16 · Mentions: 12</p>
              </section>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="article-sidebar">
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('version')}>
            <div className="sidebar-version">Version 1</div>
            <div className="sidebar-date">{(() => { const [y,m,d] = paper.date.split('-'); return new Date(Date.UTC(+y,+m-1,+d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) })()}</div>
            <div className="sidebar-checks">
              <div className="sidebar-check"><CheckIcon /> Editor approved</div>
              <div className="sidebar-check"><CheckIcon /> Plagiarism checks passed</div>
            </div>
          </button>

          <div className="sidebar-actions">
            <button className="sidebar-btn sidebar-btn--download"><DownloadIcon size={16} /> Download</button>
            <button className="sidebar-btn sidebar-btn--cite" onClick={() => setModal('cite')}><QuoteIcon size={20} /> Cite</button>
          </div>

          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('stats')}>
            <div className="sidebar-stats">
              <div className="stat-col">
                <p><span className="stat-label">Views: </span><span className="stat-value">6,746</span></p>
                <p><span className="stat-label">Citations: </span><span className="stat-value">16</span></p>
              </div>
              <div className="stat-col">
                <p><span className="stat-label">Downloads: </span><span className="stat-value">5,128</span></p>
                <p><span className="stat-label">Mentions: </span><span className="stat-value">12</span></p>
              </div>
            </div>
          </button>
        </aside>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            {modal === 'version' && (
              <>
                <h2 className="modal-heading">Version information</h2>
                <p className="modal-body">This is a placeholder for detailed information about each published version, the dates, DOIs etc. and information about the different checks or processes each version went through.</p>
              </>
            )}
            {modal === 'stats' && (
              <>
                <h2 className="modal-heading">Article metrics</h2>
                <p className="modal-body">This is a placeholder for detailed metrics about this article, including views, downloads, citations and mentions over time.</p>
              </>
            )}
            {modal === 'cite' && (
              <>
                <h2 className="modal-heading">Cite this article</h2>
                <p className="modal-body">Placeholder for information and buttons to get the citation information for this article.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
