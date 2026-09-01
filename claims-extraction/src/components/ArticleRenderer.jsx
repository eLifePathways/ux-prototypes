import { useState, useEffect, useRef } from 'react'
import Nav from './Nav.jsx'
import { DownloadIcon, QuoteIcon, FiguresIcon, OxaArrowUpIcon, OxaArrowDownIcon, OxaChevronLeftIcon, OxaCloseIcon } from './Icons.jsx'
import { articleMeta, articleSections, articleFigures } from '../articleSections.js'

// ── Article-specific data ─────────────────────────────────────

const ELIFE_ASSESSMENT = {
  significance: 'Important',
  strength: 'Convincing',
  summary: 'This is an important study with convincing evidence that the anterior insula and superior temporal sulcus contribute to interpersonal guilt and social responsibility during decisions under risk. The computational modelling approach, combining happiness ratings with reward prediction error signals, is well-suited to dissecting the subjective wellbeing effects of social choices. The fMRI findings are carefully interpreted and the two-study design strengthens the behavioural conclusions.',
  seniorEditor: 'Michael Frank',
  seniorEditorInstitution: 'Brown University, United States',
  reviewingEditor: 'Thorsten Kahnt',
  reviewingEditorInstitution: 'National Institutes of Health, United States',
}

const SIG_DOTS = { Landmark: 5, Fundamental: 4, Important: 3, Valuable: 2, Useful: 1 }
const STR_DOTS = { Exceptional: 5, Compelling: 4, Convincing: 3, Solid: 2, Incomplete: 1 }

const TIMELINE = [
  {
    version: 3,
    label: 'Version of Record published',
    currentLabel: 'Version of Record declared',
    date: 'March 24, 2026',
    events: [],
  },
  {
    version: 2,
    label: 'Version 2 published',
    currentLabel: 'Version 2 published',
    date: 'November 14, 2025',
    events: [
      { title: 'eLife Assessment updated', date: 'October 22, 2025' },
      { title: 'Peer reviews updated', date: 'October 15, 2025' },
      { title: 'Version 2 submitted', date: 'October 3, 2025' },
    ],
  },
  {
    version: 1,
    label: 'Version 1 published',
    currentLabel: 'Version 1 published',
    date: 'June 18, 2025',
    events: [
      { title: 'Author response', date: 'May 7, 2025' },
      { title: 'Peer reviewed', date: 'April 24, 2025' },
    ],
  },
  {
    version: null,
    label: 'Preprint posted',
    currentLabel: 'Preprint posted',
    date: 'March 3, 2025',
    events: [
      { title: 'Sent for peer review', date: 'February 28, 2025' },
    ],
  },
]

// ── Layout helpers ────────────────────────────────────────────

const figureMap = Object.fromEntries(articleFigures.map(f => [f.id, f]))

const sectionFigures = {
  introduction:                ['fig1'],
  'results-choices-risk':      ['fig2'],
  'results-happiness-guilt':   ['fig3', 'fig3s1'],
  'results-bold-outcomes':     ['fig4'],
  'results-bold-connectivity': ['fig5', 'fig5s1'],
}

const navSections = articleSections.map(s => ({ id: s.id, label: s.label }))

// ── Inline article figures ────────────────────────────────────

function ArticleFigure({ figId }) {
  const fig = figureMap[figId]
  if (!fig) return null
  return (
    <figure id={figId} className="article-figure" style={{ margin: '40px 0' }}>
      <img src={fig.url} alt={fig.title} style={{ width: '100%', borderRadius: '8px' }} loading="lazy" />
      <figcaption style={{ marginTop: '12px', fontSize: '13px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>{fig.label}.</strong>{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>{fig.title}.</strong>{' '}
        {fig.caption}
      </figcaption>
    </figure>
  )
}

// ── Section renderer ──────────────────────────────────────────

function Section({ section, level = 2 }) {
  const Tag = `h${Math.min(level, 4)}`
  const postFigs = sectionFigures[section.id] || []
  const headingStyle = level === 2
    ? { fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', lineHeight: '32px', marginBottom: '16px', marginTop: '48px' }
    : level === 3
    ? { fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '18px', lineHeight: '26px', marginBottom: '12px', marginTop: '32px' }
    : { fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '15px', lineHeight: '22px', marginBottom: '8px', marginTop: '24px' }

  return (
    <section id={section.id}>
      <Tag style={headingStyle}>{section.label}</Tag>
      {(section.paragraphs || []).map((para, i) => (
        <p key={i} style={{ marginBottom: '16px', fontSize: '16px', lineHeight: '26px' }}>{para}</p>
      ))}
      {postFigs.map(figId => <ArticleFigure key={figId} figId={figId} />)}
      {(section.children || []).map(child => (
        <Section key={child.id} section={child} level={level + 1} />
      ))}
    </section>
  )
}

// ── Figure viewer (IIIF-based) ────────────────────────────────

function FigureViewer({ figures, initialFig, onAllFigures, onClose }) {
  const [current, setCurrent] = useState(initialFig || figures[0])
  const idx = figures.findIndex(f => f.id === current.id)
  const prev = idx > 0 ? figures[idx - 1] : null
  const next = idx < figures.length - 1 ? figures[idx + 1] : null

  return (
    <div className="fv">
      <div className="fv-header">
        <div className="fv-header-left">
          <button className="fv-all-figures-btn" onClick={onAllFigures}>
            <OxaChevronLeftIcon size={20} /> All figures
          </button>
          <div className="fv-nav-btns">
            <button className="fv-nav-btn" disabled={!prev} onClick={() => prev && setCurrent(prev)} title="Previous figure">
              <OxaArrowUpIcon size={18} />
            </button>
            <button className="fv-nav-btn" disabled={!next} onClick={() => next && setCurrent(next)} title="Next figure">
              <OxaArrowDownIcon size={18} />
            </button>
          </div>
        </div>
        <div className="fv-header-center">
          <span className="fv-title">
            {current.label}
            <span className="fv-title-count"> ({idx + 1} of {figures.length})</span>
          </span>
        </div>
        <div className="fv-header-right">
          <button className="fv-close-btn" onClick={onClose} title="Close">
            <OxaCloseIcon size={20} />
          </button>
        </div>
      </div>
      <div className="fv-image-area" style={{ cursor: 'default' }}>
        <img src={current.url} alt={current.title} className="fv-image" />
      </div>
      <div className="fv-caption">
        <p>
          <strong>{current.label}.</strong>{' '}
          <strong>{current.title}.</strong>{' '}
          {current.caption}
        </p>
      </div>
    </div>
  )
}

// ── Modals ────────────────────────────────────────────────────

function stopProp(e) { e.stopPropagation() }

function VersionModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--version" onClick={stopProp}>
        <div className="modal-header">
          <span className="modal-header-title">Versions and timeline</span>
          <button className="modal-header-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body-scroll">
          <div className="version-timeline">
            {TIMELINE.map((entry, i) => {
              const isCurrent = entry.version === 3
              return (
                <div key={i} className="version-timeline-group">
                  {isCurrent ? (
                    <div className="version-timeline-card version-timeline-card--current">
                      <div className="version-timeline-title">{entry.currentLabel}</div>
                      <div className="version-timeline-date">{entry.date}</div>
                      <div className="version-timeline-this">（This version）</div>
                    </div>
                  ) : entry.version !== null ? (
                    <div className="version-timeline-card">
                      <div className="version-timeline-title">{entry.label}</div>
                      <div className="version-timeline-date">{entry.date}</div>
                    </div>
                  ) : (
                    <div className="version-timeline-card">
                      <div className="version-timeline-title">{entry.label}</div>
                      <div className="version-timeline-date">{entry.date}</div>
                    </div>
                  )}
                  {entry.events.length > 0 && (
                    <div className="version-timeline-events">
                      {entry.events.map((ev, j) => (
                        <div key={j} className="version-timeline-event">
                          <div className="version-timeline-event-title">{ev.title}</div>
                          <div className="version-timeline-event-date">{ev.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PeerReviewModal({ onClose }) {
  const navItems = [
    { id: 'pr-assessment', label: 'eLife Assessment' },
    { id: 'pr-process', label: 'Peer review process' },
    { id: 'pr-reviewer-1', label: 'Reviewer 1' },
    { id: 'pr-reviewer-2', label: 'Reviewer 2' },
    { id: 'pr-author-response', label: 'Author response' },
  ]
  const [activeNav, setActiveNav] = useState('pr-assessment')
  const scrollRef = useRef(null)

  function scrollTo(id) {
    setActiveNav(id)
    const el = scrollRef.current?.querySelector(`#${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const sigDots = '•'.repeat(SIG_DOTS[ELIFE_ASSESSMENT.significance] || 0)
  const strDots = '•'.repeat(STR_DOTS[ELIFE_ASSESSMENT.strength] || 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={stopProp} style={{ padding: 0 }}>
        <div className="modal-header modal-header--large" style={{ padding: '24px 48px 0', flexShrink: 0 }}>
          <span className="modal-header-spacer" />
          <span className="modal-header-title">Peer reviews</span>
          <button className="modal-header-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto' }} ref={scrollRef}>
            <div className="pr-layout">
              <nav className="pr-nav">
                <ul className="pr-nav-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {navItems.map(item => (
                    <li key={item.id}>
                      <button
                        className={`pr-nav-item${activeNav === item.id ? ' pr-nav-item--active' : ''}`}
                        onClick={() => scrollTo(item.id)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pr-content">

                {/* eLife Assessment */}
                <section className="pr-section" id="pr-assessment">
                  <h2 className="pr-h2">eLife Assessment</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="pr-assessment-meta">
                      <span className="pr-assessment-meta-item">
                        <span className="pr-body">Significance:</span>
                        <strong className="pr-body">{ELIFE_ASSESSMENT.significance}</strong>
                        <strong className="pr-body">{sigDots}</strong>
                      </span>
                      <span className="pr-assessment-meta-item">
                        <span className="pr-body">Strength of evidence:</span>
                        <strong className="pr-body">{ELIFE_ASSESSMENT.strength}</strong>
                        <strong className="pr-body">{strDots}</strong>
                      </span>
                    </div>
                    <p className="pr-assessment-quote">
                      {'"'}{ELIFE_ASSESSMENT.summary}{'"'}
                    </p>
                    <button className="pr-link">Read more about eLife assessments</button>
                  </div>
                  <div className="pr-editor-cards">
                    <div className="pr-editor-card">
                      <span className="pr-editor-role">Reviewing Editor</span>
                      <span className="pr-editor-name">{ELIFE_ASSESSMENT.reviewingEditor}</span>
                      <span className="pr-editor-institution">{ELIFE_ASSESSMENT.reviewingEditorInstitution}</span>
                    </div>
                    <div className="pr-editor-card">
                      <span className="pr-editor-role">Senior Editor</span>
                      <span className="pr-editor-name">{ELIFE_ASSESSMENT.seniorEditor}</span>
                      <span className="pr-editor-institution">{ELIFE_ASSESSMENT.seniorEditorInstitution}</span>
                    </div>
                  </div>
                </section>

                {/* Peer review process */}
                <section className="pr-section" id="pr-process">
                  <h2 className="pr-h2">Peer review process</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p className="pr-body">Public reviews were submitted in review of Version 1. Authors received additional private feedback from reviewers and have since published a revised version, along with a response to reviews included below. Reviews were updated slightly following submission of version 2 to acknowledge author revisions. Authors have since published their final Version of Record (version 3).</p>
                    <button className="pr-link">Read more about eLife's peer review process</button>
                  </div>
                </section>

                {/* Reviewer 1 */}
                <section className="pr-section" id="pr-reviewer-1">
                  <div className="pr-reviewer-header">
                    <h3 className="pr-h3">Reviewer 1</h3>
                    <p className="pr-reviewer-meta">Updated after version 2 · Reviewer identity withheld</p>
                  </div>
                  <div className="pr-reviewer-body">
                    <div className="pr-reviewer-text">
                      <p className="pr-body-heading">Summary:</p>
                      <p className="pr-body">This study examines the neural correlates of interpersonal guilt during social decision-making under risk. Using a well-designed paradigm that separates the effects of own versus partner choices on happiness, the authors identify the anterior insula and superior temporal sulcus as key regions. The computational approach using the Responsibility Redux model is a strength, and the finding that insula–IFG connectivity reflects guilt-related processing is novel and well-motivated.</p>
                      <p className="pr-body-heading">Strengths:</p>
                      <p className="pr-body">The combination of behavioural economics, computational modelling, and neuroimaging is well-executed. The two-study design—behavioural in Study 1 and fMRI in Study 2—strengthens the conclusions considerably. The happiness rating paradigm adapted from prior work is well-validated and the main claims are well-supported by the data.</p>
                      <p className="pr-body-heading">Weaknesses:</p>
                      <p className="pr-body">Some concerns about the generalisation of findings across studies and the specificity of the STS result would benefit from further clarification. In particular, it would help to see a more explicit comparison of the STS guilt signal with other socio-cognitive signals (e.g. theory of mind) that activate this region.</p>
                      <p className="pr-body" style={{ marginTop: '16px' }}>I have no additional comments following revision. The authors have adequately addressed my major concerns.</p>
                    </div>
                    <p className="pr-doi">https://doi.org/10.7554/eLife.105391.3.sa1</p>
                  </div>
                </section>

                {/* Reviewer 2 */}
                <section className="pr-section" id="pr-reviewer-2">
                  <div className="pr-reviewer-header">
                    <h3 className="pr-h3">Reviewer 2</h3>
                    <p className="pr-reviewer-meta">Updated after version 2 · Reviewer identity withheld</p>
                  </div>
                  <div className="pr-reviewer-body">
                    <div className="pr-reviewer-text">
                      <p className="pr-body-heading">Summary:</p>
                      <p className="pr-body">The manuscript reports an elegant study combining behavioural economics, computational modelling, and neuroimaging to understand the neural basis of guilt in social decisions. The two-study design is appropriate and the main claims are well-supported by the data. The happiness rating paradigm adapted from prior work is well-validated.</p>
                      <p className="pr-body-heading">Strengths:</p>
                      <p className="pr-body">The experimental design cleanly isolates the guilt signal by contrasting partner outcomes that follow participant versus partner choices. The computational model fits are convincing, and the neuroimaging results are consistent with a specific guilt-related role for the anterior insula.</p>
                      <p className="pr-body-heading">Weaknesses:</p>
                      <p className="pr-body">The specificity of the guilt operationalisation relative to other social emotions such as shame or regret could be addressed more directly. The authors should clarify how the paradigm distinguishes guilt from regret over an outcome that also affected oneself.</p>
                    </div>
                    <p className="pr-doi">https://doi.org/10.7554/eLife.105391.3.sa2</p>
                  </div>
                </section>

                {/* Author response */}
                <section className="pr-section" id="pr-author-response">
                  <div className="pr-reviewer-header">
                    <h3 className="pr-h3">Author response</h3>
                    <p className="pr-reviewer-meta">Submitted with version 2</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p className="pr-body">We thank the reviewers for their thoughtful and constructive comments. In response to the concerns raised, we have clarified the specificity of our guilt operationalisation by adding an additional analysis comparing the happiness decrement following participant choices versus partner choices across outcome valences.</p>
                    <p className="pr-body">We have also expanded the Discussion to address the relationship between guilt, shame, and regret in our paradigm. Specifically, we now discuss how our design separates guilt (own choice, partner outcome) from regret (own choice, own outcome) and from compassion (partner choice, partner outcome), and why the STS signal tracks specifically the guilt condition.</p>
                    <p className="pr-body">We agree with Reviewer 2's point regarding the STS and have added a comparison with the TPJ—a canonical theory-of-mind region—to contextualise our STS finding within the broader social neuroscience literature.</p>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CiteModal({ onClose }) {
  const doi = articleMeta.doi
  const [copied, setCopied] = useState(null)

  const bibtex = `@article{gadeke2026,
  author  = {G{\\"{a}}deke, Maria and Willems, Tom Eric and {Salah Ahmed}, Omar and Weber, Bernd and Hurlemann, Ren{\\'{e}} and Schultz, Johannes},
  title   = {Contributions of insula and superior temporal sulcus to interpersonal guilt and responsibility in social decisions},
  journal = {eLife},
  year    = {2026},
  volume  = {15},
  doi     = {${doi}},
}`

  const formats = [
    {
      key: 'apa',
      label: 'APA',
      text: `Gädeke, M., Willems, T. E., Salah Ahmed, O., Weber, B., Hurlemann, R., & Schultz, J. (2026). Contributions of insula and superior temporal sulcus to interpersonal guilt and responsibility in social decisions. eLife, 15. https://doi.org/${doi}`,
    },
    {
      key: 'mla',
      label: 'MLA',
      text: `Gädeke, Maria, et al. "Contributions of insula and superior temporal sulcus to interpersonal guilt and responsibility in social decisions." eLife, vol. 15, 2026. https://doi.org/${doi}`,
    },
    {
      key: 'bibtex',
      label: 'BibTeX',
      text: bibtex,
    },
  ]

  function copyText(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={stopProp}>
        <div className="modal-header">
          <span className="modal-header-title">Cite this article</span>
          <button className="modal-header-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {formats.map(fmt => (
              <div key={fmt.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>{fmt.label}</span>
                  <button
                    onClick={() => copyText(fmt.text, fmt.key)}
                    style={{
                      fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
                      color: copied === fmt.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px',
                    }}
                  >
                    {copied === fmt.key ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  fontFamily: 'monospace', fontSize: '13px', lineHeight: '20px',
                  background: 'var(--color-surface)', borderRadius: '6px',
                  padding: '12px 16px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  color: 'var(--color-text-primary)',
                }}>{fmt.text}</pre>
              </div>
            ))}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              DOI: <a href={`https://doi.org/${doi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-primary)' }}>{doi}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={stopProp}>
        <div className="modal-header">
          <span className="modal-header-title">Article metrics</span>
          <button className="modal-header-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Views', value: '4,821', detail: 'Full-text views since publication' },
                { label: 'Downloads', value: '612', detail: 'PDF downloads since publication' },
                { label: 'Citations', value: '3', detail: 'Citations tracked via CrossRef' },
                { label: 'Mentions', value: '27', detail: 'News, blogs, and social media' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--color-surface)', borderRadius: '8px', padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '28px', lineHeight: '36px', color: 'var(--color-text-primary)' }}>{s.value}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', marginTop: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{s.detail}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Metrics are updated periodically. Data sourced from Crossref, Dimensions, and Altmetric.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FiguresModal({ onClose }) {
  const [viewer, setViewer] = useState(null)

  if (viewer) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal--figure-viewer" onClick={stopProp}>
          <FigureViewer
            figures={articleFigures}
            initialFig={viewer}
            onAllFigures={() => setViewer(null)}
            onClose={onClose}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={stopProp}>
        <div className="modal-header">
          <span className="modal-header-title">Figures</span>
          <button className="modal-header-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body-scroll">
          <div className="modal-figures-grid">
            {articleFigures.map(fig => (
              <button key={fig.id} className="modal-figure-thumb" onClick={() => setViewer(fig)}>
                <img src={fig.url} alt={fig.title} loading="lazy" />
                <div className="modal-figure-thumb-label">{fig.label}</div>
                <div className="modal-figure-thumb-caption">{fig.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function ArticleRenderer() {
  const [activeSection, setActiveSection] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [modal, setModal] = useState(null)
  const ticking = useRef(false)

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          const sections = document.querySelectorAll('.article-content section[id]')
          let current = null
          sections.forEach(el => {
            if (el.getBoundingClientRect().top <= 120) current = el.id
          })
          setActiveSection(current)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sigDots = '•'.repeat(SIG_DOTS[ELIFE_ASSESSMENT.significance] || 0)
  const strDots = '•'.repeat(STR_DOTS[ELIFE_ASSESSMENT.strength] || 0)

  return (
    <div className="article-page">
      <Nav
        scrolled={scrolled}
        noBorder
        onLogoClick={scrolled ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : null}
      />

      <div className="article-page-inner">

        {/* ── Main content ── */}
        <div className="article-main">
          <div className="article-header">
            <div className="card-tags article-tags">
              <span className="tag tag--subject">Neuroscience</span>
              <span className="tag tag--keyword">Social decision-making</span>
              <span className="tag tag--keyword">Guilt</span>
              <span className="tag tag--keyword">Insula</span>
            </div>
            <h1 className="article-title">{articleMeta.title}</h1>
            <p className="article-authors">
              {articleMeta.authors.join(', ')}
            </p>
            <p className="article-doi">
              <a href={`https://doi.org/${articleMeta.doi}`} target="_blank" rel="noreferrer">
                https://doi.org/{articleMeta.doi}
              </a>
            </p>
          </div>

          <div className="article-body">
            <nav className="section-nav">
              {navSections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? 'active' : ''}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="article-content">
              {articleSections.map(section => (
                <Section key={section.id} section={section} level={2} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="article-sidebar">

          {/* Version card */}
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('version')}>
            <div className="sidebar-version-row">
              <span className="sidebar-version">Version of Record</span>
              <span className="sidebar-version-dot">·</span>
              <span className="sidebar-date">v3</span>
            </div>
            <p className="sidebar-version-status">March 24, 2026 · Declared as Version of Record</p>
          </button>

          {/* eLife Assessment card */}
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('peerreview')}>
            <div className="sidebar-assessment">
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{sigDots}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.significance}</strong>
              </div>
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{strDots}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.strength}</strong>
              </div>
            </div>
          </button>

          {/* Download / Cite */}
          <div className="sidebar-actions">
            <a
              className="sidebar-btn sidebar-btn--download"
              href="https://elifesciences.org/articles/105391.pdf"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <DownloadIcon size={16} /> Download
            </a>
            <button className="sidebar-btn sidebar-btn--cite" onClick={() => setModal('cite')}>
              <QuoteIcon size={20} /> Cite
            </button>
          </div>

          {/* Figures card */}
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('figures')}>
            <div className="sidebar-figures">
              <div className="sidebar-figure-row">
                <FiguresIcon size={16} />
                <span>5 Figures, 2 figure supplements</span>
              </div>
            </div>
          </button>

          {/* Stats card */}
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal('stats')}>
            <div className="sidebar-stats">
              <div className="stat-col">
                <p><span className="stat-label">Views: </span><span className="stat-value">4,821</span></p>
                <p><span className="stat-label">Citations: </span><span className="stat-value">3</span></p>
              </div>
              <div className="stat-col">
                <p><span className="stat-label">Downloads: </span><span className="stat-value">612</span></p>
                <p><span className="stat-label">Mentions: </span><span className="stat-value">27</span></p>
              </div>
            </div>
          </button>

        </aside>
      </div>

      {/* ── Modals ── */}
      {modal === 'version'    && <VersionModal    onClose={() => setModal(null)} />}
      {modal === 'peerreview' && <PeerReviewModal onClose={() => setModal(null)} />}
      {modal === 'cite'       && <CiteModal       onClose={() => setModal(null)} />}
      {modal === 'stats'      && <StatsModal      onClose={() => setModal(null)} />}
      {modal === 'figures'    && <FiguresModal    onClose={() => setModal(null)} />}
    </div>
  )
}
