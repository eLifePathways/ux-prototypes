import Nav from './Nav.jsx'
import { useState, useEffect, useRef } from 'react'
import { DownloadIcon, QuoteIcon, FiguresIcon, DatasetIcon, SupplementaryIcon, OxaArrowUpIcon, OxaArrowDownIcon, OxaChevronLeftIcon, OxaCloseIcon } from './Icons.jsx'
import MdastRenderer, { flattenText } from './MdastRenderer.jsx'

const IMAGE_BASE = 'https://reader.openrxivlabs.org'

const INTERACTIVE_CONDITIONS = [
  { id: 'acq-cs-plus',  label: 'Acquisition CS+',  shortLabel: 'Acq CS+',  hue: 0 },
  { id: 'acq-cs-minus', label: 'Acquisition CS−',  shortLabel: 'Acq CS−',  hue: 200 },
  { id: 'rev-cs-plus',  label: 'Reversal CS+',     shortLabel: 'Rev CS+',  hue: 100 },
  { id: 'rev-cs-minus', label: 'Reversal CS−',     shortLabel: 'Rev CS−',  hue: 270 },
]

// Approximate % positions on the brain-scan figure image
const BRAIN_HOTSPOTS = [
  { id: 'dacc',    x: 50, y: 22, label: 'Dorsal ACC',       detail: 'Strongest CS generalisation effect across phases' },
  { id: 'vmpfc',   x: 50, y: 35, label: 'vmPFC',            detail: 'Fear extinction and contingency re-learning' },
  { id: 'amyg-l',  x: 33, y: 54, label: 'Left Amygdala',    detail: 'Threat-cue similarity encoding, acquisition phase' },
  { id: 'amyg-r',  x: 67, y: 54, label: 'Right Amygdala',   detail: 'Threat-cue similarity encoding, reversal phase' },
  { id: 'hipp',    x: 42, y: 67, label: 'Hippocampus',      detail: 'Context-dependent memory for CS–US contingencies' },
  { id: 'insula',  x: 24, y: 44, label: 'Anterior Insula',  detail: 'Interoceptive fear response and US expectancy' },
]

// ── Mention extraction ────────────────────────────────────────
// Walk mdast body; collect paragraphs that contain a crossReference
// pointing at figureHtmlId. Returns [{section, node}].
function hasCrossRef(node, htmlId) {
  if (node.type === 'crossReference' && node.html_id === htmlId) return true
  return (node.children || []).some(c => hasCrossRef(c, htmlId))
}
function extractMentions(mdastChildren, figureHtmlId) {
  if (!figureHtmlId) return []
  const results = []
  let currentSection = null
  function walk(nodes) {
    for (const n of nodes || []) {
      if (n.type === 'heading') { currentSection = flattenText(n); continue }
      if (n.type === 'paragraph' && hasCrossRef(n, figureHtmlId)) {
        results.push({ section: currentSection, node: n })
      }
      if (n.children) walk(n.children)
    }
  }
  walk(mdastChildren)
  return results
}

// eLife assessment data for this article (10.7554/eLife.105126)
const ELIFE_ASSESSMENT = {
  significance: 'Important',
  strength: 'Convincing',
  summary: 'This is an <strong>important</strong> study with <strong>convincing</strong> evidence that multi-voxel fMRI activity patterns for threat-conditioned stimuli are altered by learning CS-US contingencies. The analyses are dense, but rigorous. The protocol is quite nuanced and complex, but the authors have done a fair job of explaining and presenting the results. The work is relevant for our understanding of how effective learning changes neural stimulus representation in the human brain.',
  seniorEditor: 'Christian Büchel',
  seniorEditorInstitution: 'University Medical Center Hamburg-Eppendorf, Hamburg, Germany',
}

const SIG_DOTS = { Landmark: 5, Fundamental: 4, Important: 3, Valuable: 2, Useful: 1 }
const STR_DOTS = { Exceptional: 5, Compelling: 4, Convincing: 3, Solid: 2, Incomplete: 1 }

function wrapLastWord(html) {
  return html.replace(/(\S+)(\s*(?:<\/\w+>\s*)*)$/, '<span class="assessment-last-word">$1</span>$2')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function getFigureType(enumerator) {
  const n = +enumerator
  if (n === 1) return 'interactive'
  if (n === 2) return 'ultra-hi-res'
  if (n === 3) return 'video'
  return 'default'
}

// Prototype image overrides keyed by figure enumerator
const BASE = import.meta.env.BASE_URL
const FIGURE_IMAGE_OVERRIDES = {
  1: `${BASE}assets/transit-2020.png`,
  2: `${BASE}assets/figure2.png`,
  3: `${BASE}assets/figure3.png`,
}

export default function ArticlePage({ article, concepts = [] }) {
  const { frontmatter, mdast, references } = article
  const [showDetails, setShowDetails] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('abstract')
  const [modal, setModal] = useState(null) // null | { type, data }

  // Lock body scroll while any modal is open
  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modal])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track active section via IntersectionObserver
  useEffect(() => {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80', 10)
    const rootMargin = `-${navH + 8}px 0px -60% 0px`

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveSection(top.target.id)
        }
      },
      { rootMargin, threshold: 0 }
    )

    const t = setTimeout(() => {
      document.querySelectorAll('.article-content section[id]').forEach(el => observer.observe(el))
    }, 100)

    return () => { clearTimeout(t); observer.disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build section list from mdast blocks
  const sections = (mdast?.children || []).filter(block => {
    const heading = block.children?.find(c => c.type === 'heading')
    return heading && block.children?.length > 1
  })

  const navSections = [
    { id: 'abstract', label: 'Abstract' },
    ...sections.map(block => {
      const heading = block.children?.find(c => c.type === 'heading')
      return {
        id: heading?.html_id || heading?.identifier,
        label: flattenText(heading),
      }
    }),
    { id: 'acknowledgments', label: 'Acknowledgments' },
    { id: 'references', label: 'References' },
  ]

  // Collect all figures from mdast
  function findFigures(node, acc = []) {
    if (node.type === 'container' && node.kind === 'figure') acc.push(node)
    for (const c of node.children || []) findFigures(c, acc)
    return acc
  }
  const figures = findFigures(mdast)

  // Collect all tables from mdast
  function findTables(node, acc = []) {
    if (node.type === 'container' && node.kind === 'table') acc.push(node)
    for (const c of node.children || []) findTables(c, acc)
    return acc
  }
  const tables = findTables(mdast)

  // Open modals
  function openFigure(htmlId) {
    const fig = figures.find(f => (f.html_id || f.label) === htmlId) || figures[0]
    setModal({ type: 'figure', data: fig })
  }

  function openTable(htmlId) {
    const tbl = tables.find(t => (t.html_id || t.label) === htmlId) || tables[0]
    setModal({ type: 'table', data: tbl })
  }

  function openReference(label) {
    const ref = references?.cite?.data?.[label]
    const order = references?.cite?.order || []
    const idx = order.indexOf(label)
    if (ref) setModal({ type: 'reference', data: { label, idx, ...ref } })
  }

  function openReferenceByIndex(idx) {
    const order = references?.cite?.order || []
    const key = order[idx]
    const ref = references?.cite?.data?.[key]
    if (ref) setModal({ type: 'reference', data: { label: key, idx, ...ref } })
  }

  // Affiliation lookup
  const affMap = {}
  ;(frontmatter.affiliations || []).forEach(a => { affMap[a.id] = a })

  const abstractBlocks = frontmatter.parts?.abstract?.mdast?.children || []
  const ackBlocks = frontmatter.parts?.acknowledgments?.mdast?.children || []

  return (
    <div className="article-page">
      <Nav
        scrolled={true}
        noBorder
        onLogoClick={scrolled ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : null}
      />

      <div className="article-page-inner">
        {/* ── Main left column ── */}
        <div className="article-main">
          <div className="article-header">
            <div className="card-tags article-tags">
              {frontmatter.subject && (
                <span className="tag tag--subject">{frontmatter.subject}</span>
              )}
              {concepts.map(kw => (
                <span key={kw} className="tag tag--keyword">{kw}</span>
              ))}
            </div>

            <h1 className="article-title">{frontmatter.title}</h1>

            {(() => {
              const authors = frontmatter.authors || []
              return showDetails ? (
                <ul className="author-list-expanded">
                  {authors.map((author, i) => (
                    <li key={author.id}>
                      {author.name}{author.corresponding ? '*' : ''}
                      <sup>{(author.affiliations || []).map(aid => {
                        const idx = (frontmatter.affiliations || []).findIndex(a => a.id === aid)
                        return idx + 1
                      }).join(',')}</sup>
                      {i < authors.length - 1 ? ',' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="article-authors">
                  {authors.map((author, i) => (
                    <span key={author.id}>
                      {author.name}{author.corresponding ? '*' : ''}
                      {i < authors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )
            })()}

            {showDetails && (
              <>
                {frontmatter.authors?.find(a => a.corresponding) && (
                  <p className="author-correspondence">
                    *For correspondence: {frontmatter.authors.find(a => a.corresponding)?.email}
                  </p>
                )}
                <ol className="institution-list">
                  {(frontmatter.affiliations || []).map(aff => (
                    <li key={aff.id}>{aff.name}{aff.country ? `, ${aff.country}` : ''}</li>
                  ))}
                </ol>
              </>
            )}

            <p className="article-doi">
              <a href={`https://doi.org/${frontmatter.doi}`} target="_blank" rel="noopener noreferrer">
                https://doi.org/{frontmatter.doi}
              </a>
            </p>

            <button className="show-more-details" onClick={() => setShowDetails(s => !s)}>
              {showDetails ? 'Show less' : 'Show more details'}
            </button>
          </div>

          {/* Assessment quote */}
          <div className="article-assessment-quote">
            <div className="assessment-quote-inner">
              <span className="assessment-quote-open">&ldquo;</span>
              <span
                className="assessment-quote-body"
                dangerouslySetInnerHTML={{ __html: wrapLastWord(ELIFE_ASSESSMENT.summary) }}
              />
            </div>
            <p className="article-editor-credit">
              <span className="article-editor-name">{ELIFE_ASSESSMENT.seniorEditor}</span>
              <span className="article-editor-institution">, {ELIFE_ASSESSMENT.seniorEditorInstitution}</span>
            </p>
          </div>

          {/* Section nav + body */}
          <div className="article-body">
            <nav className="section-nav">
              {navSections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault()
                    setActiveSection(s.id)
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >{s.label}</a>
              ))}
            </nav>

            <div className="article-content">
              {/* Abstract */}
              <section id="abstract">
                <h2>Abstract</h2>
                <MdastRenderer
                  nodes={abstractBlocks}
                  references={references}
                  onFigureClick={openFigure}
                  onTableClick={openTable}
                  onReferenceClick={openReference}
                />
              </section>

              {/* Body sections */}
              {sections.map((block, i) => {
                const heading = block.children?.find(c => c.type === 'heading')
                const sectionId = heading?.html_id || heading?.identifier || `section-${i}`
                return (
                  <section key={block.key || i} id={sectionId}>
                    <MdastRenderer
                      nodes={block.children}
                      references={references}
                      onFigureClick={openFigure}
                      onTableClick={openTable}
                      onReferenceClick={openReference}
                    />
                  </section>
                )
              })}

              {/* Acknowledgments */}
              {ackBlocks.length > 0 && (
                <section id="acknowledgments">
                  <h2>Acknowledgments</h2>
                  <MdastRenderer
                    nodes={ackBlocks}
                    references={references}
                    onFigureClick={openFigure}
                    onReferenceClick={openReference}
                  />
                </section>
              )}

              {/* References */}
              {references?.cite && (
                <section id="references">
                  <h2>References</h2>
                  <div className="reference-cards">
                    {(references.cite.order || []).map((key, i) => {
                      const ref = references.cite.data?.[key]
                      if (!ref) return null
                      return (
                        <button
                          key={key}
                          id={`ref-${key}`}
                          className="ref-card"
                          onClick={() => openReference(key)}
                        >
                          <span className="ref-card-num">{i + 1}</span>
                          <span className="ref-card-text" dangerouslySetInnerHTML={{ __html: ref.html }} />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <aside className="article-sidebar">
          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'version' })}>
            <div className="sidebar-version">Version 2</div>
            <div className="sidebar-date">{formatDate(frontmatter.date)}</div>
            <div className="sidebar-assessment">
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{'•'.repeat(SIG_DOTS[ELIFE_ASSESSMENT.significance])}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.significance}</strong>
              </div>
              <div className="sidebar-assessment-line">
                <span className="card-term-dots">{'•'.repeat(STR_DOTS[ELIFE_ASSESSMENT.strength])}</span>{' '}
                <strong>{ELIFE_ASSESSMENT.strength}</strong>
              </div>
              <p className="sidebar-version-status">Revised since peer review</p>
            </div>
          </button>

          <div className="sidebar-actions">
            <button className="sidebar-btn sidebar-btn--download"><DownloadIcon size={16} /> Download</button>
            <button className="sidebar-btn sidebar-btn--cite" onClick={() => setModal({ type: 'cite' })}><QuoteIcon size={20} /> Cite</button>
          </div>

          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'figures' })}>
            <div className="sidebar-figures">
              <div className="sidebar-figure-row"><FiguresIcon size={16} /> <span>5 Figures</span></div>
              <div className="sidebar-figure-row"><SupplementaryIcon size={16} /> <span>3 Datasets</span></div>
              <div className="sidebar-figure-row"><DatasetIcon size={16} /> <span>4 Supplementary files</span></div>
            </div>
          </button>

          <button className="sidebar-card sidebar-card--btn" onClick={() => setModal({ type: 'stats' })}>
            <div className="sidebar-stats">
              <div className="stat-col">
                <p><span className="stat-label">Views: </span><span className="stat-value">—</span></p>
                <p><span className="stat-label">Citations: </span><span className="stat-value">—</span></p>
              </div>
              <div className="stat-col">
                <p><span className="stat-label">Downloads: </span><span className="stat-value">—</span></p>
                <p><span className="stat-label">Mentions: </span><span className="stat-value">—</span></p>
              </div>
            </div>
          </button>
        </aside>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className={(() => {
              if (modal.type === 'figures') return 'modal modal--large'
              if (modal.type === 'figure' || modal.type === 'table') return 'modal modal--figure-viewer'
              if (modal.type === 'reference') return 'modal modal--reference'
              return 'modal'
            })()}
            onClick={e => e.stopPropagation()}
          >
            {/* Figure/table/figures/reference viewers manage their own header / close button */}
            {modal.type !== 'figure' && modal.type !== 'table' && modal.type !== 'figures' && modal.type !== 'reference' && (
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            )}

            {modal.type === 'version' && (
              <>
                <h2 className="modal-heading">Version info and peer reviews</h2>
                <p className="modal-body">This is a placeholder for detailed information about each published version, the dates, DOIs etc., information about the different checks or processes each version went through, and the full peer reviews associated with each version.</p>
              </>
            )}

            {modal.type === 'cite' && (
              <>
                <h2 className="modal-heading">Cite this article</h2>
                <p className="modal-body">Placeholder for citation formats (APA, MLA, BibTeX, etc.) for this article.</p>
              </>
            )}

            {modal.type === 'stats' && (
              <>
                <h2 className="modal-heading">Article metrics</h2>
                <p className="modal-body">Placeholder for detailed metrics about this article, including views, downloads, citations and mentions over time.</p>
              </>
            )}

            {modal.type === 'figures' && (
              <FiguresModal
                figures={figures}
                tables={tables}
                references={references}
                initialScrollTop={modal.scrollTop}
                onSelectFigure={(fig, scrollTop) => setModal({ type: 'figure', data: fig, figuresScrollTop: scrollTop })}
                onSelectTable={(tbl, scrollTop) => setModal({ type: 'table', data: tbl, figuresScrollTop: scrollTop })}
                onClose={() => setModal(null)}
              />
            )}

            {modal.type === 'figure' && modal.data && (() => {
              const figType = getFigureType(modal.data.enumerator)
              const sharedProps = {
                figures,
                mdast,
                onAllFigures: () => setModal({ type: 'figures', scrollTop: modal.figuresScrollTop }),
                onNavigate: fig => setModal({ type: 'figure', data: fig, figuresScrollTop: modal.figuresScrollTop }),
                onClose: () => setModal(null),
                references,
              }
              if (figType === 'interactive') return (
                <InteractiveLightbox figure={modal.data} {...sharedProps} />
              )
              if (figType === 'ultra-hi-res') return (
                <ZoomableLightbox figure={modal.data} {...sharedProps} />
              )
              if (figType === 'video') return (
                <VideoLightbox figure={modal.data} {...sharedProps} />
              )
              return (
                <DefaultLightbox figure={modal.data} {...sharedProps} />
              )
            })()}

            {modal.type === 'table' && modal.data && (
              <TableLightbox
                table={modal.data}
                tables={tables}
                mdast={mdast}
                onAllFigures={() => setModal({ type: 'figures', scrollTop: modal.figuresScrollTop })}
                onNavigate={tbl => setModal({ type: 'table', data: tbl, figuresScrollTop: modal.figuresScrollTop })}
                onClose={() => setModal(null)}
                references={references}
              />
            )}

            {modal.type === 'reference' && modal.data && (
              <ReferenceLightbox
                data={modal.data}
                total={(references?.cite?.order || []).length}
                onClose={() => setModal(null)}
                onAllRefs={() => setModal(null)}
                onPrev={() => openReferenceByIndex(modal.data.idx - 1)}
                onNext={() => openReferenceByIndex(modal.data.idx + 1)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fake table mentions (one per table enumerator) ───────────
function fp(text) {
  return { type: 'paragraph', children: [{ type: 'text', value: text }] }
}
const FAKE_TABLE_MENTIONS = {
  1: [
    {
      section: 'Results',
      node: fp('Decoding accuracy in early visual cortex was significantly above chance (mean 76.3%, SD = 4.1; Table 1), consistent with robust stimulus-specific representations persisting across conditioning phases.'),
    },
    {
      section: 'Results',
      node: fp('Across participants, classification accuracy was highest in occipital regions (Table 1), with a reliable drop-off moving anteriorly into prefrontal cortex, suggesting a posterior-to-anterior gradient in CS specificity.'),
    },
    {
      section: 'Discussion',
      node: fp('The pattern of decoding accuracies reported in Table 1 closely mirrors findings from prior fear-learning paradigms, lending convergent validity to the multivariate approach adopted here.'),
    },
  ],
  2: [
    {
      section: 'Results',
      node: fp('The vmPFC cluster (Table 2; peak: x = 2, y = 44, z = −14, k = 312 voxels) showed preferential activation for CS+ stimuli during the reversal phase, consistent with a role in updating threat-contingency representations.'),
    },
    {
      section: 'Results',
      node: fp('Dorsal ACC activation (Table 2) was bilateral and centred on the border of BA24 and BA32, overlapping with regions previously implicated in CS generalisation gradients.'),
    },
    {
      section: 'Methods',
      node: fp('Peak voxel coordinates in MNI space for all reported clusters are provided in Table 2, alongside cluster-level p-values, effect size estimates (partial η²), and cluster extent in mm³.'),
    },
  ],
  3: [
    {
      section: 'Results',
      node: fp('Group-level summary statistics for SCR and valence ratings across all conditions and phases are presented in Table 3. Significant main effects of condition were observed for both measures (all p < 0.01).'),
    },
    {
      section: 'Discussion',
      node: fp('Our findings replicate prior reports of CS generalisation gradients in dACC (Table 3), extending this work by demonstrating condition-specific representational shifts that track behavioural contingency updating.'),
    },
  ],
}

// ── Shared figure viewer shell ───────────────────────────────
// Handles header, mentions toggle, and navigation for all figure types.
// The figure content (image area + caption) is passed as children.
function FigureViewerShell({
  figure, figures, mdast, onNavigate, onAllFigures, onClose, references, figType, children,
  titlePrefix = 'Figure', allLabel = 'All figures', showContentLabel = 'Show figure',
  overrideMentions,
}) {
  const [showMentions, setShowMentions] = useState(false)

  const currentIdx = figures ? figures.findIndex(f => f.label === figure.label) : -1
  const prev = currentIdx > 0 ? figures[currentIdx - 1] : null
  const next = figures && currentIdx < figures.length - 1 ? figures[currentIdx + 1] : null

  const figureHtmlId = figure.html_id || figure.identifier || figure.label
  const mentions = overrideMentions ?? (mdast ? extractMentions(mdast.children || [], figureHtmlId) : [])

  const typeLabel = figType === 'interactive' ? 'Interactive'
    : figType === 'ultra-hi-res' ? 'Ultra hi-res'
    : figType === 'video' ? 'Video'
    : null

  return (
    <div className="fv">
      <div className="fv-header">

        {/* Left: All figures + nav */}
        <div className="fv-header-left">
          <button className="fv-all-figures-btn" onClick={onAllFigures}>
            <OxaChevronLeftIcon size={20} /> {allLabel}
          </button>
          <div className="fv-nav-btns">
            <button className="fv-nav-btn" disabled={!prev} onClick={() => prev && onNavigate?.(prev)} title={`Previous ${titlePrefix.toLowerCase()}`}>
              <OxaArrowUpIcon size={18} />
            </button>
            <button className="fv-nav-btn" disabled={!next} onClick={() => next && onNavigate?.(next)} title={`Next ${titlePrefix.toLowerCase()}`}>
              <OxaArrowDownIcon size={18} />
            </button>
          </div>
        </div>

        {/* Centre: title only */}
        <div className="fv-header-center">
          <span className="fv-title">
            {titlePrefix} {figure.enumerator}
            {figures?.length ? <span className="fv-title-count"> (of {figures.length})</span> : null}
          </span>
        </div>

        {/* Right: Show mentions toggle + close */}
        <div className="fv-header-right">
          <button className="fv-mentions-btn" onClick={() => setShowMentions(m => !m)}>
            {showMentions ? showContentLabel : 'Show mentions'}
          </button>
          <button className="fv-close-btn" onClick={onClose} title="Close"><OxaCloseIcon size={20} /></button>
        </div>

        {/* Tag row: spans all 3 columns, badge centred */}
        {(showMentions || typeLabel) && (
          <div className="fv-header-tag-row">
            <span className={`fv-type-badge${showMentions ? ' fv-type-badge--mentions' : ''}`}>
              {showMentions ? 'Mentions' : typeLabel}
            </span>
          </div>
        )}

      </div>

      {showMentions
        ? <MentionsView mentions={mentions} figure={figure} references={references} titlePrefix={titlePrefix} />
        : children
      }
    </div>
  )
}

// ── Mentions view ─────────────────────────────────────────────
function MentionsView({ mentions, figure, references, titlePrefix = 'Figure' }) {
  if (!mentions.length) {
    return (
      <div className="fv-mentions-empty">
        No in-text mentions found for {titlePrefix} {figure.enumerator}.
      </div>
    )
  }

  // Group consecutive mentions under the same section heading
  const groups = []
  mentions.forEach((m, i) => {
    const last = groups[groups.length - 1]
    if (last && last.section === m.section) {
      last.items.push({ ...m, n: i + 1 })
    } else {
      groups.push({ section: m.section, items: [{ ...m, n: i + 1 }] })
    }
  })

  return (
    <div className="fv-mentions">
      <div className="fv-mentions-inner">
      {groups.map((g, gi) => (
        <div key={gi} className="fv-mentions-group">
          {g.section && <p className="fv-mentions-section">{g.section}</p>}
          {g.items.map(item => (
            <div key={item.n} className="fv-mentions-card">
              <span className="fv-mentions-num">{item.n}.</span>
              <div className="fv-mentions-text">
                <MdastRenderer nodes={[item.node]} references={references} />
              </div>
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  )
}

// ── Default figure lightbox ──────────────────────────────────
function DefaultLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const src = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="default"
    >
      <div className="fv-image-area" style={{ cursor: 'default' }}>
        {src && <img src={src} alt={imageNode?.alt || ''} className="fv-image" />}
      </div>
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Interactive figure lightbox ──────────────────────────────
function InteractiveLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[figure.enumerator] || defaultSrc

  const [condition, setCondition] = useState(INTERACTIVE_CONDITIONS[0].id)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const imageAreaRef = useRef(null)

  const activeCondition = INTERACTIVE_CONDITIONS.find(c => c.id === condition)
  const imgFilter = activeCondition?.hue
    ? `hue-rotate(${activeCondition.hue}deg) saturate(0.85) brightness(1.05)`
    : 'none'

  function clampZoom(z) { return Math.min(Math.max(z, 1), 5) }

  function handleWheel(e) {
    e.preventDefault()
    setZoom(z => {
      const next = clampZoom(z - e.deltaY * 0.006)
      if (next === 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }

  // Attach wheel listener as non-passive so preventDefault() works
  useEffect(() => {
    const el = imageAreaRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pan when zooming back to 1
  useEffect(() => { if (zoom <= 1) setOffset({ x: 0, y: 0 }) }, [zoom])

  function handleMouseDown(e) {
    if (zoom <= 1) return
    setDragging(true)
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handleMouseMove(e) {
    if (!dragging || !dragOrigin.current) return
    setOffset({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y })
  }

  function handleMouseUp() { setDragging(false) }

  function resetView() { setZoom(1); setOffset({ x: 0, y: 0 }) }

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="interactive"
    >
      {/* ── Image area ── */}
      <div
        className="fv-image-area"
        ref={imageAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        {/* Zoomable/pannable layer */}
        <div
          className="fv-image-transform"
          style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)` }}
        >
          {src && (
            <img
              src={src}
              alt={imageNode?.alt || ''}
              className="fv-image"
              style={{ filter: imgFilter, transition: 'filter 0.4s ease' }}
              draggable={false}
            />
          )}

          {/* Hotspot markers — scale with image */}
          {BRAIN_HOTSPOTS.map(h => (
            <button
              key={h.id}
              className={`fv-hotspot${activeHotspot === h.id ? ' fv-hotspot--active' : ''}`}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onMouseEnter={() => setActiveHotspot(h.id)}
              onMouseLeave={() => setActiveHotspot(null)}
              onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
              aria-label={h.label}
            >
              <span className="fv-hotspot-dot" />
              {activeHotspot === h.id && (
                <div className={`fv-tooltip fv-tooltip--${h.x < 50 ? 'right' : 'left'}`}>
                  <strong>{h.label}</strong>
                  <span>{h.detail}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Condition panel — stays fixed in viewer, doesn't pan */}
        <div className="fv-condition-panel">
          <p className="fv-condition-panel-title">Condition</p>
          {INTERACTIVE_CONDITIONS.map(c => (
            <button
              key={c.id}
              className={`fv-condition-btn${condition === c.id ? ' active' : ''}`}
              onClick={() => setCondition(c.id)}
            >
              {c.shortLabel}
            </button>
          ))}
          {zoom > 1 && (
            <button className="fv-condition-btn fv-reset-btn" onClick={resetView}>
              Reset zoom
            </button>
          )}
        </div>
      </div>

      {/* ── Caption ── */}
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Video figure lightbox ────────────────────────────────────
function VideoLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[figure.enumerator] || defaultSrc

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="video"
    >
      <div className="fv-image-area fv-image-area--video" style={{ cursor: 'default' }}>
        {src && <img src={src} alt={imageNode?.alt || ''} className="fv-image" />}
        <div className="fv-play-btn" aria-label="Play video">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M10 7L22 14L10 21V7Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Ultra hi-res figure lightbox ─────────────────────────────
function ZoomableLightbox({ figure, figures, mdast, onNavigate, onAllFigures, onClose, references }) {
  const imageNode = figure.children?.find(c => c.type === 'image')
  const captionNode = figure.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[figure.enumerator] || defaultSrc

  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const imageAreaRef = useRef(null)

  function clampZoom(z) { return Math.min(Math.max(z, 1), 20) }

  function handleWheel(e) {
    e.preventDefault()
    setZoom(z => clampZoom(z - e.deltaY * 0.005))
  }

  function handleMouseDown(e) {
    if (zoom <= 1) return
    setDragging(true)
    dragOrigin.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handleMouseMove(e) {
    if (!dragging || !dragOrigin.current) return
    setOffset({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y })
  }

  function handleMouseUp() { setDragging(false) }

  function resetView() { setZoom(1); setOffset({ x: 0, y: 0 }) }

  // Non-passive wheel listener so preventDefault() works
  useEffect(() => {
    const el = imageAreaRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset pan when zooming back to 1
  useEffect(() => { if (zoom <= 1) setOffset({ x: 0, y: 0 }) }, [zoom])

  return (
    <FigureViewerShell
      figure={figure} figures={figures} mdast={mdast}
      onNavigate={onNavigate} onAllFigures={onAllFigures} onClose={onClose}
      references={references} figType="ultra-hi-res"
    >
      {/* ── Image area ── */}
      <div
        className="fv-image-area"
        ref={imageAreaRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
      >
        <div
          className="fv-image-transform"
          style={{ transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)` }}
        >
          {src && (
            <img src={src} alt={imageNode?.alt || ''} className="fv-image" draggable={false} />
          )}
        </div>
        {zoom > 1 && (
          <button className="fv-reset-zoom-btn" onClick={resetView}>Reset zoom</button>
        )}
      </div>

      {/* ── Caption ── */}
      {captionNode && (
        <div className="fv-caption">
          <MdastRenderer nodes={captionNode.children} references={references} />
        </div>
      )}
    </FigureViewerShell>
  )
}

// ── Table lightbox ──────────────────────────────────────────
function TableLightbox({ table, tables, mdast, onNavigate, onAllFigures, onClose, references }) {
  const tableNode = table.children?.find(c => c.type === 'table')
  const captionNode = table.children?.find(c => c.type === 'caption')
  const isNarrow = table.enumerator <= 2

  return (
    <FigureViewerShell
      figure={table}
      figures={tables}
      mdast={mdast}
      onNavigate={onNavigate}
      onAllFigures={onAllFigures}
      onClose={onClose}
      references={references}
      figType={null}
      titlePrefix="Table"
      allLabel="All figures"
      showContentLabel="Show table"
      overrideMentions={FAKE_TABLE_MENTIONS[table.enumerator] || []}
    >
      <div className="tv-content" style={isNarrow ? { maxWidth: '800px' } : undefined}>
        <div className="tv-table-scroll">
          {tableNode && <MdastRenderer nodes={[tableNode]} references={references} />}
        </div>
        {captionNode && (
          <div className="tv-caption">
            <MdastRenderer nodes={captionNode.children} references={references} />
          </div>
        )}
      </div>
    </FigureViewerShell>
  )
}

// ── Figures and data modal ───────────────────────────────────
const FD_SUPP_FILES = [
  { label: 'Supplementary file 1', desc: 'Demographic information and behavioral data summary', size: '48 KB' },
  { label: 'Supplementary file 2', desc: 'Full statistical model outputs and parameter estimates', size: '132 KB' },
  { label: 'Source data 1', desc: 'Raw fMRI signal data for CS+ and CS− conditions', size: '2.4 MB' },
]

const FD_SECTIONS = [
  { id: 'figures', label: 'Figures' },
  { id: 'data', label: 'Data' },
  { id: 'supplementary', label: 'Supplementary files' },
  { id: 'data-availability', label: 'Data availability' },
]

function FiguresModal({ figures, tables, references, onSelectFigure, onSelectTable, onClose, initialScrollTop }) {
  const [activeSection, setActiveSection] = useState('figures')
  const contentRef = useRef(null)

  useEffect(() => {
    if (initialScrollTop && contentRef.current) {
      contentRef.current.scrollTop = initialScrollTop
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function scrollToSection(id) {
    const container = contentRef.current
    const el = document.getElementById(`fds-${id}`)
    if (el && container) {
      const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 8
      container.scrollTo({ top, behavior: 'smooth' })
    }
    setActiveSection(id)
  }

  function handleScroll() {
    const container = contentRef.current
    if (!container) return
    const containerTop = container.getBoundingClientRect().top
    for (const s of [...FD_SECTIONS].reverse()) {
      const el = document.getElementById(`fds-${s.id}`)
      if (el && el.getBoundingClientRect().top - containerTop <= 80) {
        setActiveSection(s.id)
        return
      }
    }
    setActiveSection('figures')
  }

  return (
    <div className="fd-modal">
      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-side" />
        <h2 className="fd-title">Figures and data</h2>
        <div className="fd-header-side fd-header-side--right">
          <button className="fv-mentions-btn">Download all</button>
          <button className="fv-close-btn" onClick={onClose} title="Close"><OxaCloseIcon size={20} /></button>
        </div>
      </div>

      {/* Body */}
      <div className="fd-scroll-area" ref={contentRef} onScroll={handleScroll}>
        <div className="fd-body">
        {/* Jump nav */}
        <nav className="fd-nav">
          {FD_SECTIONS.map(s => (
            <button
              key={s.id}
              className={`fd-nav-item${activeSection === s.id ? ' active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="fd-content">
        <div className="fd-content-inner">

          {/* ── Figures ── */}
          <section id="fds-figures" className="fd-section">
            <h2 className="fd-section-heading">Figures</h2>
            <MdastRenderer
              nodes={figures}
              references={references}
              onFigureClick={htmlId => {
                const fig = figures.find(f => (f.html_id || f.label) === htmlId) || figures[0]
                onSelectFigure(fig, contentRef.current?.scrollTop ?? 0)
              }}
            />
          </section>

          {/* ── Data (tables) ── */}
          <section id="fds-data" className="fd-section">
            <h2 className="fd-section-heading">Data</h2>
            <MdastRenderer
              nodes={tables}
              references={references}
              onTableClick={htmlId => {
                const tbl = tables.find(t => (t.html_id || t.label) === htmlId) || tables[0]
                onSelectTable(tbl, contentRef.current?.scrollTop ?? 0)
              }}
            />
          </section>

          {/* ── Supplementary files ── */}
          <section id="fds-supplementary" className="fd-section">
            <h2 className="fd-section-heading">Supplementary files</h2>
            <div className="modal-data-list">
              {FD_SUPP_FILES.map(s => (
                <div key={s.label} className="modal-data-item">
                  <div className="modal-data-item-info">
                    <span className="modal-data-item-label">{s.label}</span>
                    <span className="modal-data-item-desc">{s.desc}</span>
                    <span className="modal-data-item-meta">{s.size}</span>
                  </div>
                  <button className="modal-data-item-btn">Download</button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Data availability ── */}
          <section id="fds-data-availability" className="fd-section">
            <h2 className="fd-section-heading">Data availability statement</h2>
            <p className="fd-data-avail-text">
              The data that support the findings of this study are available from the corresponding
              author on reasonable request. Raw fMRI data and analysis scripts are deposited at
              OpenNeuro (accession number ds004876, doi: 10.18112/openneuro.ds004876.v1.0.0).
              Statistical parametric maps are available at NeuroVault (collection ID: 16423).
            </p>
          </section>

        </div>
        </div>
        </div>
      </div>
    </div>
  )
}


// ── Fake article preview content (reused across all references) ──
const FAKE_ARTICLE_PREVIEW = {
  abstract: 'The psychology of extinction has been studied for decades. Approximately 10 years ago, however, there began a concerted effort to understand the neural circuits of extinction of fear conditioning, in both animals and humans. Progress during this period has been facilitated by a high degree of coordination between rodent and human researchers examining fear extinction. Here we review the major advances and highlight new approaches to understanding and exploiting fear extinction. Research in fear extinction could serve as a model for translational research in other areas of behavioral neuroscience.',
  introduction: 'Many fMRI experiments use rapid presentation of trials of different types (conditions). Because the time between trial onsets (or Stimulus Onset Asynchrony, SOA) is typically less than the duration of the BOLD impulse response, the responses to successive trials overlap. The majority of fMRI analyses use linear convolution models like the General Linear Model (GLM) to extract estimates of responses to different trial-types (i.e., to deconvolve the fMRI response). The parameters of the GLM, reflecting the mean response to each trial-type, or even to each individual trial, are estimated by minimizing the squared error across scans.',
}

// ── Reference lightbox ───────────────────────────────────────
function ReferenceLightbox({ data, total, onClose, onAllRefs, onPrev, onNext }) {
  const idx = data.idx ?? 0
  const hasPrev = idx > 0
  const hasNext = idx < total - 1

  // Extract title: plain text between "(year). " and ". <i>" (journal in italics)
  const titleMatch = (data.html || '').match(/\)\.\s+(.+?)\.\s+<i>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const doi = data.url || ''
  const pubmedUrl = doi
    ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(doi)}`
    : 'https://pubmed.ncbi.nlm.nih.gov/'
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(title || doi)}`

  function copyCitation() {
    const text = (data.html || '').replace(/<[^>]+>/g, '')
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="ref-modal">
      {/* Header */}
      <div className="ref-modal-header">
        <div className="ref-modal-header-left">
          <button className="fv-all-figures-btn" onClick={onAllRefs}>
            <OxaChevronLeftIcon size={14} /> All references
          </button>
          <div className="fv-nav-btns">
            <button className="fv-nav-btn" onClick={onPrev} disabled={!hasPrev} aria-label="Previous reference">
              <OxaArrowUpIcon size={16} />
            </button>
            <button className="fv-nav-btn" onClick={onNext} disabled={!hasNext} aria-label="Next reference">
              <OxaArrowDownIcon size={16} />
            </button>
          </div>
        </div>
        <div className="ref-modal-header-center">
          Reference {idx + 1}
        </div>
        <div className="ref-modal-header-right">
          <button className="fv-mentions-btn">Show mentions</button>
          <button className="fv-close-btn" onClick={onClose}><OxaCloseIcon size={16} /></button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="ref-modal-scroll">
        <div className="ref-modal-inner">

          {/* Citation */}
          <div className="ref-modal-section">
            <h3 className="ref-modal-section-title">Citation</h3>
            <div className="ref-modal-citation-card">
              <div className="modal-reference-citation" dangerouslySetInnerHTML={{ __html: data.html }} />
              {doi && <div className="ref-modal-doi">{doi}</div>}
            </div>
            <div className="ref-modal-actions">
              <a href={pubmedUrl} target="_blank" rel="noreferrer" className="ref-modal-action-btn">PubMed</a>
              <a href={scholarUrl} target="_blank" rel="noreferrer" className="ref-modal-action-btn">Google Scholar</a>
              <button className="ref-modal-action-btn" onClick={copyCitation}>Copy citation</button>
            </div>
          </div>

          {/* Article preview */}
          <div className="ref-modal-section">
            <h3 className="ref-modal-section-title">Article preview</h3>
            <div className="ref-modal-preview-card">
              <h2 className="ref-modal-preview-title">{title || 'Referenced article'}</h2>
              <div className="ref-modal-preview-section">
                <h4 className="ref-modal-preview-section-heading">Abstract</h4>
                <p className="ref-modal-preview-text">{FAKE_ARTICLE_PREVIEW.abstract}</p>
              </div>
              <div className="ref-modal-preview-section">
                <h4 className="ref-modal-preview-section-heading">Introduction</h4>
                <p className="ref-modal-preview-text">{FAKE_ARTICLE_PREVIEW.introduction}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
