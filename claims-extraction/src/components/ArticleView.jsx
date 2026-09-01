import { useState } from 'react'
import MdastRenderer, { flattenText } from './MdastRenderer.jsx'

export default function ArticleView({ article }) {
  const { frontmatter, mdast, references } = article
  const [activeSection, setActiveSection] = useState(null)

  // Build author affiliation lookup
  const affMap = {}
  ;(frontmatter.affiliations || []).forEach(a => { affMap[a.id] = a })

  // Scroll to a figure
  function scrollToFigure(htmlId) {
    const el = document.getElementById(htmlId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('figure-highlight')
      setTimeout(() => el.classList.remove('figure-highlight'), 2000)
    }
  }

  // Extract abstract text from frontmatter.parts
  const abstractMdast = frontmatter.parts?.abstract?.mdast
  const abstractBlocks = abstractMdast?.children || []

  // Extract acknowledgments
  const ackMdast = frontmatter.parts?.acknowledgments?.mdast
  const ackBlocks = ackMdast?.children || []

  // Sections from mdast body
  const sections = mdast?.children || []

  // Build nav items from top-level section headings
  const navItems = sections
    .map(block => {
      const heading = block.children?.find(c => c.type === 'heading')
      if (!heading) return null
      return {
        label: flattenText(heading),
        id: heading.html_id || heading.identifier,
      }
    })
    .filter(Boolean)

  return (
    <div className="article-layout">
      {/* Header */}
      <header className="site-header">
        <div className="site-header-inner">
          <svg className="site-logo" width="120" height="32" viewBox="0 0 120 32" fill="none" aria-label="eLife Pathways">
            <text x="0" y="24" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="20" fill="#440535">eLife</text>
            <circle cx="60" cy="16" r="4" fill="#D71D62"/>
            <text x="70" y="24" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="20" fill="#440535">Pathways</text>
          </svg>
        </div>
      </header>

      <div className="article-outer">
        {/* Left sidebar – navigation */}
        <aside className="article-nav">
          <nav>
            <ul className="nav-list">
              {abstractBlocks.length > 0 && (
                <li><a href="#abstract" className="nav-link">Abstract</a></li>
              )}
              {navItems.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="nav-link">{item.label}</a>
                </li>
              ))}
              {ackBlocks.length > 0 && (
                <li><a href="#acknowledgments" className="nav-link">Acknowledgments</a></li>
              )}
              {references?.cite?.order?.length > 0 && (
                <li><a href="#references" className="nav-link">References</a></li>
              )}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="article-main">
          {/* Title + meta */}
          <div className="article-header">
            {frontmatter.subject && (
              <p className="article-subject">{frontmatter.subject}</p>
            )}
            <h1 className="article-title">{frontmatter.title}</h1>

            {/* Authors */}
            <div className="article-authors">
              {(frontmatter.authors || []).map((author, i) => (
                <span key={author.id} className="author">
                  {i > 0 && <span className="author-sep">, </span>}
                  <span className="author-name">{author.name}</span>
                  {author.corresponding && <span className="author-corresponding" title="Corresponding author"> ✉</span>}
                </span>
              ))}
            </div>

            {/* Affiliations */}
            <div className="article-affiliations">
              {(frontmatter.affiliations || []).map(aff => (
                <p key={aff.id} className="affiliation">
                  <span className="aff-name">{aff.name}</span>
                  {aff.country && <span className="aff-country">, {aff.country}</span>}
                </p>
              ))}
            </div>

            {/* Meta row */}
            <div className="article-meta">
              {frontmatter.doi && (
                <span className="meta-item">
                  DOI: <a href={`https://doi.org/${frontmatter.doi}`} target="_blank" rel="noreferrer">{frontmatter.doi}</a>
                </span>
              )}
              {frontmatter.date && (
                <span className="meta-item">
                  {new Date(frontmatter.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Abstract */}
          {abstractBlocks.length > 0 && (
            <section id="abstract" className="article-section abstract-section">
              <h2 className="section-heading">Abstract</h2>
              <MdastRenderer nodes={abstractBlocks} references={references} onFigureClick={scrollToFigure} />
            </section>
          )}

          {/* Body sections */}
          {sections.map((block, i) => {
            const heading = block.children?.find(c => c.type === 'heading')
            const sectionId = heading?.html_id || heading?.identifier || `section-${i}`
            const headingText = heading ? flattenText(heading) : ''

            // Skip the thematicBreak-only block
            if (block.children?.length === 1 && block.children[0].type === 'thematicBreak') {
              return null
            }

            return (
              <section key={block.key || i} id={sectionId} className="article-section">
                <MdastRenderer
                  nodes={block.children}
                  references={references}
                  onFigureClick={scrollToFigure}
                />
              </section>
            )
          })}

          {/* Acknowledgments */}
          {ackBlocks.length > 0 && (
            <section id="acknowledgments" className="article-section">
              <h2 className="section-heading">Acknowledgments</h2>
              <MdastRenderer nodes={ackBlocks} references={references} onFigureClick={scrollToFigure} />
            </section>
          )}

          {/* References */}
          {references?.cite && (
            <section id="references" className="article-section references-section">
              <h2 className="section-heading">References</h2>
              <ol className="reference-list">
                {(references.cite.order || []).map(key => {
                  const ref = references.cite.data?.[key]
                  if (!ref) return null
                  return (
                    <li key={key} id={`ref-${key}`} className="reference-item">
                      <span dangerouslySetInnerHTML={{ __html: ref.html }} />
                    </li>
                  )
                })}
              </ol>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
