/**
 * Recursive OXA/MyST mdast renderer.
 */
import { useState } from 'react'

const IMAGE_BASE = 'https://reader.openrxivlabs.org'

export function flattenText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  return (node.children || []).map(flattenText).join('')
}

export default function MdastRenderer({ nodes, references, onFigureClick, onTableClick, onReferenceClick }) {
  if (!nodes) return null
  return nodes.map((node, i) => (
    <Node
      key={node.key || i}
      node={node}
      references={references}
      onFigureClick={onFigureClick}
      onTableClick={onTableClick}
      onReferenceClick={onReferenceClick}
    />
  ))
}

function R({ nodes, references, onFigureClick, onTableClick, onReferenceClick }) {
  return (
    <MdastRenderer
      nodes={nodes}
      references={references}
      onFigureClick={onFigureClick}
      onTableClick={onTableClick}
      onReferenceClick={onReferenceClick}
    />
  )
}

function Node({ node, references, onFigureClick, onTableClick, onReferenceClick }) {
  const p = { references, onFigureClick, onTableClick, onReferenceClick }

  switch (node.type) {
    case 'block':
      return (
        <div>
          <R nodes={node.children} {...p} />
        </div>
      )

    case 'heading': {
      const id = node.html_id || node.identifier
      const H = `h${node.depth || 2}`
      return (
        <H id={id}>
          <R nodes={node.children} {...p} />
        </H>
      )
    }

    case 'paragraph':
      return <p><R nodes={node.children} {...p} /></p>

    case 'text':
      return node.value

    case 'emphasis':
      return <em><R nodes={node.children} {...p} /></em>

    case 'strong':
      return <strong><R nodes={node.children} {...p} /></strong>

    case 'subscript':
      return <sub><R nodes={node.children} {...p} /></sub>

    case 'superscript':
      return <sup><R nodes={node.children} {...p} /></sup>

    case 'link':
      return (
        <a href={node.url} target="_blank" rel="noreferrer">
          <R nodes={node.children} {...p} />
        </a>
      )

    case 'abbreviation':
      return (
        <abbr title={node.title}>
          <R nodes={node.children} {...p} />
        </abbr>
      )

    case 'cite': {
      const citeText = flattenText(node).replace(/\s*&\s*/g, ' and ')
      return (
        <button
          className="cite-btn"
          onClick={() => onReferenceClick?.(node.label)}
          title="View reference"
        >
          ({citeText})
        </button>
      )
    }

    case 'citeGroup': {
      const cites = node.children || []
      return (
        <span className="cite-group">
          {'('}
          {cites.map((c, i) => {
            const text = flattenText(c).replace(/\s*&\s*/g, ' and ')
            return (
              <span key={c.key || i}>
                {i > 0 && '; '}
                <button
                  className="cite-btn"
                  onClick={() => onReferenceClick?.(c.label)}
                  title="View reference"
                >
                  {text}
                </button>
              </span>
            )
          })}
          {')'}
        </span>
      )
    }

    case 'crossReference': {
      if (node.kind === 'figure') {
        return (
          <button
            className="xref xref-figure"
            onClick={() => onFigureClick?.(node.html_id)}
          >
            <R nodes={node.children} {...p} />
          </button>
        )
      }
      return (
        <a href={`#${node.html_id}`} className="xref">
          <R nodes={node.children} {...p} />
        </a>
      )
    }

    case 'table': {
      // Split rows into header rows (all cells are header) and body rows
      const rows = node.children || []
      const headerRows = rows.filter(r => r.children?.every(c => c.header))
      const bodyRows = rows.filter(r => !r.children?.every(c => c.header))
      return (
        <table className="mdast-table">
          {headerRows.length > 0 && (
            <thead>{headerRows.map((r, i) => <Node key={r.key || i} node={r} {...p} />)}</thead>
          )}
          <tbody>{bodyRows.map((r, i) => <Node key={r.key || i} node={r} {...p} />)}</tbody>
        </table>
      )
    }

    case 'tableRow':
      return <tr>{node.children?.map((cell, i) => <Node key={cell.key || i} node={cell} {...p} />)}</tr>

    case 'tableCell': {
      const Tag = node.header ? 'th' : 'td'
      return (
        <Tag
          align={node.align || undefined}
          rowSpan={node.rowspan || undefined}
          colSpan={node.colspan || undefined}
        >
          <R nodes={node.children} {...p} />
        </Tag>
      )
    }

    case 'container': {
      if (node.kind === 'figure') {
        return <FigureCard node={node} {...p} />
      }
      if (node.kind === 'table') {
        return <TableCard node={node} {...p} />
      }
      return <div><R nodes={node.children} {...p} /></div>
    }

    case 'image': {
      const src = node.url?.startsWith('/') ? `${IMAGE_BASE}${node.url}` : node.url
      return <img src={src} alt={node.alt || ''} className="figure-image" loading="lazy" />
    }

    case 'caption':
      return (
        <figcaption className="figure-caption">
          <R nodes={node.children} {...p} />
        </figcaption>
      )

    case 'captionNumber':
      return <span className="caption-number"><R nodes={node.children} {...p} /></span>

    case 'thematicBreak':
      return <hr />

    default:
      if (node.children?.length) return <R nodes={node.children} {...p} />
      return null
  }
}

// ── Figure type helper ───────────────────────────────────────
function getFigureType(enumerator) {
  const n = +enumerator
  if (n === 1) return 'interactive'
  if (n === 2) return 'ultra-hi-res'
  if (n === 3) return 'video'
  return 'default'
}

const BADGE_LABELS = {
  interactive: 'Interactive',
  'ultra-hi-res': 'Ultra hi-res',
  video: 'Video',
}

// Prototype image overrides keyed by figure enumerator
const BASE = import.meta.env.BASE_URL
const FIGURE_IMAGE_OVERRIDES = {
  1: `${BASE}assets/transit-2020.png`,
  2: `${BASE}assets/figure2.png`,
  3: `${BASE}assets/figure3.png`,
}

// ── New figure card ──────────────────────────────────────────
function FigureCard({ node, references, onFigureClick, onReferenceClick }) {
  const id = node.html_id || node.identifier || node.label
  const type = getFigureType(node.enumerator)
  const imageNode = node.children?.find(c => c.type === 'image')
  const captionNode = node.children?.find(c => c.type === 'caption')
  const defaultSrc = imageNode?.url?.startsWith('/') ? `${IMAGE_BASE}${imageNode.url}` : imageNode?.url
  const src = FIGURE_IMAGE_OVERRIDES[node.enumerator] || defaultSrc

  const hintText = type === 'interactive'
    ? '▶  Open interactive viewer'
    : type === 'ultra-hi-res'
    ? '⊕  Open ultra hi-res view'
    : type === 'video'
    ? '▶  Play video'
    : '⊕  Expand figure'

  return (
    <figure
      id={id}
      className="figure-card"
      style={{ scrollMarginTop: 'calc(var(--nav-h) + 16px)', cursor: 'pointer' }}
      onClick={() => onFigureClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onFigureClick?.(id)}
      aria-label={`Open Figure ${node.enumerator} in ${type} viewer`}
    >
      {/* Header row: label + badge */}
      <div className="figure-card-header">
        <span className="figure-title">Figure {node.enumerator}</span>
        {type !== 'default' && (
          <span className={`figure-badge figure-badge--${type}`}>
            {BADGE_LABELS[type]}
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="figure-card-image-btn">
        {src && (
          <img
            src={src}
            alt={imageNode?.alt || ''}
            className="figure-card-image"
            loading="lazy"
          />
        )}
        <span className="figure-card-hint">{hintText}</span>
      </div>

      {/* Caption — 3-line clamp via CSS; full text visible in lightbox */}
      {captionNode && (
        <figcaption className="figure-card-caption">
          <MdastRenderer
            nodes={captionNode.children}
            references={references}
            onFigureClick={onFigureClick}
            onReferenceClick={onReferenceClick}
          />
        </figcaption>
      )}
    </figure>
  )
}

// ── Table card (inline in article) ──────────────────────────
function TableCard({ node, references, onTableClick, onFigureClick, onReferenceClick }) {
  const id = node.html_id || node.identifier || node.label
  const captionNode = node.children?.find(c => c.type === 'caption')
  const tableNode = node.children?.find(c => c.type === 'table')

  return (
    <figure
      id={id}
      className="table-card"
      style={{ scrollMarginTop: 'calc(var(--nav-h) + 16px)', cursor: 'pointer' }}
      onClick={() => onTableClick?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onTableClick?.(id)}
      aria-label={`Open Table ${node.enumerator} in viewer`}
    >
      <div className="figure-card-header">
        <span className="figure-title">Table {node.enumerator}</span>
      </div>

      {/* Scrollable table preview — both axes */}
      <div className="table-card-preview">
        {tableNode && (
          <MdastRenderer
            nodes={[tableNode]}
            references={references}
            onFigureClick={onFigureClick}
            onTableClick={onTableClick}
            onReferenceClick={onReferenceClick}
          />
        )}
      </div>

      {captionNode && (
        <figcaption className="figure-card-caption">
          <MdastRenderer
            nodes={captionNode.children}
            references={references}
            onFigureClick={onFigureClick}
            onTableClick={onTableClick}
            onReferenceClick={onReferenceClick}
          />
        </figcaption>
      )}
    </figure>
  )
}
