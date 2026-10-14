/*
  Looks up a DOI the tester typed, in the tester's own browser:
    1. eLife articles already in the prototype (and earlier imports)
    2. Europe PMC (covers bioRxiv, medRxiv and other preprint servers)
    3. Crossref (fallback; abstracts are often missing)
  Returns { status: 'found', article } | { status: 'invalid' } |
          { status: 'not-found' } | { status: 'error' }.
*/
import { findArticleByDoi, normaliseDoi, saveImportedArticle } from '../shared/store.js';

const TIMEOUT_MS = 10000;

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Strip tags except simple inline ones; JATS <jats:italic> becomes <i>.
function cleanInline(html = '') {
  return String(html)
    .replace(/<(\/?)jats:italic>/g, '<$1i>')
    .replace(/<(\/?)(i|em|sub|sup)\b[^>]*>/gi, '\u0001$1$2\u0002')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u0001(\/?)(i|em|sub|sup)\u0002/gi, '<$1$2>')
    .replace(/\s+/g, ' ')
    .trim();
}

function paragraphs(html = '') {
  return String(html)
    .split(/<\/(?:jats:)?p>|<br\s*\/?>|\n{2,}/i)
    .map(cleanInline)
    .filter(Boolean);
}

function idFor(doi) {
  return 'doi-' + doi;
}

async function fromEuropePmc(doi) {
  const q = encodeURIComponent(`DOI:"${doi}"`);
  const data = await getJson(
    `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${q}&resultType=core&format=json&pageSize=1`,
  );
  const r = data?.resultList?.result?.[0];
  if (!r || r.doi?.toLowerCase() !== doi) return null;
  const authors = r.authorList?.author?.map((a) => a.fullName || a.collectiveName).filter(Boolean) || [];
  const date = r.firstPublicationDate || r.firstIndexDate || null;
  return {
    id: idFor(doi),
    doi,
    title: cleanInline(r.title),
    authors: authors.length ? authors : (r.authorString || '').split(/,\s*/).filter(Boolean),
    abstract: paragraphs(r.abstractText || ''),
    subjects: [],
    published: date,
    versionDate: date,
    statusDate: date,
    url: `https://doi.org/${doi}`,
    source: r.bookOrReportDetails?.publisher || r.journalInfo?.journal?.title || 'Preprint',
    imported: true,
  };
}

async function fromCrossref(doi) {
  const data = await getJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const m = data?.message;
  if (!m) return null;
  const parts = (m.posted || m.published || m.issued)?.['date-parts']?.[0];
  const date = parts ? [parts[0], String(parts[1] || 1).padStart(2, '0'), String(parts[2] || 1).padStart(2, '0')].join('-') : null;
  return {
    id: idFor(doi),
    doi,
    title: cleanInline(m.title?.[0] || 'Untitled'),
    authors: (m.author || []).map((a) => [a.given, a.family].filter(Boolean).join(' ') || a.name).filter(Boolean),
    abstract: paragraphs(m.abstract || ''),
    subjects: [],
    published: date,
    versionDate: date,
    statusDate: date,
    url: `https://doi.org/${doi}`,
    source: m.institution?.[0]?.name || m.publisher || '',
    imported: true,
  };
}

export async function lookupDoi(input) {
  const doi = normaliseDoi(input);
  if (!doi) return { status: 'invalid' };

  const known = findArticleByDoi(doi);
  if (known) return { status: 'found', article: known };

  let failures = 0;
  for (const source of [fromEuropePmc, fromCrossref]) {
    try {
      const article = await source(doi);
      if (article?.title) {
        saveImportedArticle(article);
        return { status: 'found', article };
      }
    } catch {
      failures++;
    }
  }
  // Both services unreachable -> 'error'; otherwise the DOI wasn't found.
  return { status: failures === 2 ? 'error' : 'not-found' };
}
