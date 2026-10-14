#!/usr/bin/env node
/*
  Builds src/data/articles.json from the public eLife API.

  Run from the project folder in Terminal:
    npm run fetch-articles

  Takes up to PER_SUBJECT recent research articles from each eLife subject,
  until TARGET articles are collected, and keeps only what the prototype needs:
  title, authors, abstract, DOI, subjects and dates.
  eLife content is CC-BY; each article page credits and links to the original.
*/
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.elifesciences.org';
const TARGET = 100;
const PER_SUBJECT = 5;
const DELAY_MS = 150;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/articles.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API + path, { headers: { Accept: '*/*' } });
    if (res.ok) return res.json();
    if (res.status === 404) return null;
    console.warn(`  ${res.status} on ${path} (attempt ${attempt})`);
    await sleep(1000 * attempt);
  }
  throw new Error(`Failed: ${path}`);
}

// Keep only simple inline markup (italics, sub/superscript); drop everything else.
function cleanInline(html = '') {
  return String(html)
    .replace(/<(\/?)(i|em|sub|sup)\b[^>]*>/gi, '\u0001$1$2\u0002')
    .replace(/<[^>]+>/g, '')
    .replace(/\u0001(\/?)(i|em|sub|sup)\u0002/gi, '<$1$2>')
    .replace(/\s+/g, ' ')
    .trim();
}

function authorName(a) {
  if (!a) return null;
  if (a.type === 'person') return a.name?.preferred || a.name?.index || null;
  if (a.type === 'group') return a.name || null;
  if (a.type === 'on-behalf-of') return null;
  return a.name?.preferred || (typeof a.name === 'string' ? a.name : null);
}

function abstractParagraphs(abstract) {
  if (!abstract?.content) return [];
  const out = [];
  const walk = (blocks) => {
    for (const b of blocks) {
      if (b.type === 'paragraph' && b.text) out.push(cleanInline(b.text));
      else if (b.content) walk(b.content);
    }
  };
  walk(abstract.content);
  return out.filter(Boolean);
}

const day = (d) => (d ? String(d).slice(0, 10) : null);

async function main() {
  console.log('Fetching subjects…');
  const subjects = (await get('/subjects?per-page=100')).items;
  console.log(`  ${subjects.length} subjects`);

  // Enough per subject to reach TARGET (e.g. 19 subjects -> 6 each = 114),
  // then trimmed to TARGET by taking one from each subject in turn.
  const perSubject = Math.max(PER_SUBJECT, Math.ceil(TARGET / subjects.length));
  console.log(`  taking up to ${perSubject} per subject`);

  const picked = new Map();
  const buckets = [];
  for (const subject of subjects) {
    const bucket = [];
    buckets.push(bucket);
    const q = `/search?for=&type[]=research-article&subject[]=${subject.id}&sort=date&order=desc&per-page=${perSubject * 2}`;
    const results = (await get(q))?.items || [];
    let taken = 0;
    for (const item of results) {
      if (taken >= perSubject) break;
      if (picked.has(item.id)) continue;
      await sleep(DELAY_MS);
      const a = await get(`/articles/${item.id}`);
      if (!a) continue;
      const abstract = abstractParagraphs(a.abstract);
      const authors = (a.authors || []).map(authorName).filter(Boolean);
      if (!abstract.length || !authors.length) continue;
      picked.set(item.id, {
        id: String(a.id),
        doi: a.doi,
        title: cleanInline(a.title),
        authors,
        abstract,
        subjects: (a.subjects || []).map((s) => s.name),
        published: day(a.published),
        versionDate: day(a.versionDate || a.published),
        statusDate: day(a.statusDate || a.versionDate || a.published),
        url: `https://elifesciences.org/articles/${a.id}`,
      });
      bucket.push(item.id);
      taken++;
    }
    console.log(`  ${subject.name}: ${taken} (total ${picked.size})`);
    await sleep(DELAY_MS);
  }

  // Round-robin across subjects so every subject stays represented.
  const chosen = [];
  for (let round = 0; chosen.length < TARGET && buckets.some((b) => b.length > round); round++) {
    for (const b of buckets) {
      if (chosen.length >= TARGET) break;
      if (b[round]) chosen.push(picked.get(b[round]));
    }
  }

  const articles = chosen.sort((x, y) => (y.statusDate || '').localeCompare(x.statusDate || ''));
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(articles, null, 2) + '\n');
  console.log(`\nWrote ${articles.length} articles to src/data/articles.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
