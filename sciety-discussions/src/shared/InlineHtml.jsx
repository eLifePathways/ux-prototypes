/*
  Renders article titles/abstracts that may contain simple inline markup
  (<i>, <em>, <sub>, <sup>). The fetch script strips every other tag.
*/
const ALLOWED = /<(\/?)(i|em|sub|sup)>/gi;

function sanitize(html = '') {
  return String(html)
    .replace(/&(?![a-z#0-9]+;)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/&lt;(\/?)(i|em|sub|sup)>/gi, '<$1$2>')
    .replace(ALLOWED, '<$1$2>');
}

export default function InlineHtml({ as: Tag = 'span', html, ...props }) {
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}
