/*
  Prototype data layer shared by both apps.

  - Articles come from src/data/articles.json (built by scripts/fetch-articles.mjs).
  - Seeded discussion comes from src/data/seed-comments.json.
  - The single fake tester profile is in src/data/profile.json.
  - Anything a tester does (login, posts, replies, edits, deletes, reports,
    imported DOIs) is kept in this browser's localStorage under the "sdp:"
    prefix and wiped on logout or with ?reset. Nothing is sent to a server.
*/
import { useSyncExternalStore } from 'react';
import rawArticles from '../data/articles.json';
import seed from '../data/seed-comments.json';
import profile from '../data/profile.json';

/*
  Keep the prototype looking current: every date in the data files is moved
  forward by the number of days since DATA_DATE (when the data was prepared),
  so "latest activity" stays recent whenever a test session happens.
*/
const DATA_DATE = '2026-10-14';
const DAY = 24 * 60 * 60 * 1000;
const OFFSET_DAYS = Math.max(0, Math.floor((Date.now() - Date.parse(DATA_DATE)) / DAY));
function shiftDate(value) {
  if (!value || !OFFSET_DAYS) return value;
  const iso = new Date(Date.parse(value) + OFFSET_DAYS * DAY).toISOString();
  return value.length <= 10 ? iso.slice(0, 10) : iso;
}

// Articles, always ordered with the latest version first.
const articles = rawArticles
  .map((a) => ({
    ...a,
    published: shiftDate(a.published),
    versionDate: shiftDate(a.versionDate),
    statusDate: shiftDate(a.statusDate),
  }))
  .sort((x, y) => (y.versionDate || '').localeCompare(x.versionDate || ''));

const seedComments = seed.comments.map((c) => ({ ...c, createdAt: shiftDate(c.createdAt) }));

const PREFIX = 'sdp:';
const KEYS = {
  comments: PREFIX + 'comments', // tester's own posts and replies
  deleted: PREFIX + 'deleted', // ids of deleted posts
  reported: PREFIX + 'reported', // ids of posts the tester reported
  session: PREFIX + 'session', // { loggedIn: true }
  imported: PREFIX + 'imported', // { [id]: article } from DOI lookup
};

/* ---------- localStorage helpers (never throw) ---------- */
function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: prototype keeps working for this page view */
  }
  notify();
}

/* ---------- change subscription (same tab + other tabs) ---------- */
const listeners = new Set();
let version = 0;
function notify() {
  version++;
  listeners.forEach((l) => l());
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith(PREFIX)) notify();
  });
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** Re-render a component whenever prototype data changes. */
export function useStoreVersion() {
  return useSyncExternalStore(subscribe, () => version);
}

/* ---------- reset ---------- */
export function resetAll() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  notify();
}

/** Handles ?reset in the address bar (moderator use), then removes it. */
export function handleResetParam() {
  const url = new URL(window.location.href);
  if (url.searchParams.has('reset')) {
    resetAll();
    url.searchParams.delete('reset');
    window.history.replaceState(null, '', url.toString());
  }
}

/* ---------- session (the tester enters their name at login) ---------- */
function handleFor(name) {
  const slug = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || profile.handle;
}
/** The tester. Name and handle come from the name entered at login (profile.json is the fallback). */
export const ME = {
  id: 'me',
  get name() {
    return read(KEYS.session, null)?.name || profile.name;
  },
  get handle() {
    return handleFor(read(KEYS.session, null)?.name || profile.name);
  },
  orcid: profile.orcid,
};

export function isLoggedIn() {
  return Boolean(read(KEYS.session, null)?.loggedIn);
}
export function logIn(name) {
  write(KEYS.session, { loggedIn: true, name: String(name || '').trim() });
}
/** Logging out wipes everything the tester did, ready for the next session. */
export function logOut() {
  resetAll();
}
export function useSession() {
  useStoreVersion();
  return { loggedIn: isLoggedIn(), user: ME };
}

/* ---------- articles ---------- */
export function getArticles() {
  return articles;
}

export function getImportedArticles() {
  return Object.values(read(KEYS.imported, {}));
}

export function getArticle(id) {
  return articles.find((a) => a.id === id) || read(KEYS.imported, {})[id] || null;
}

export function saveImportedArticle(article) {
  write(KEYS.imported, { ...read(KEYS.imported, {}), [article.id]: article });
}

/** Normalise "https://doi.org/10.x/y", "doi:10.x/y" etc. to "10.x/y" (lower case). */
export function normaliseDoi(input = '') {
  const match = String(input).trim().match(/10\.\d{4,9}\/\S+/);
  return match ? match[0].replace(/[.,;]+$/, '').toLowerCase() : null;
}

/** Finds an eLife article (or an earlier import) by DOI, including versioned eLife DOIs. */
export function findArticleByDoi(doi) {
  const target = normaliseDoi(doi);
  if (!target) return null;
  const unversioned = target.replace(/^(10\.7554\/elife\.\d+)\.\d+$/, '$1');
  const all = [...articles, ...getImportedArticles()];
  return all.find((a) => [target, unversioned].includes(a.doi.toLowerCase())) || null;
}

export function getRelatedArticles(article, count = 3) {
  const subject = article.subjects?.[0];
  const same = articles.filter((a) => a.id !== article.id && a.subjects?.[0] === subject);
  const others = articles.filter((a) => a.id !== article.id && a.subjects?.[0] !== subject);
  return [...same, ...others].slice(0, count);
}

/* ---------- users ---------- */
const usersById = Object.fromEntries(seed.users.map((u) => [u.id, u]));
export function getUser(id) {
  if (id === ME.id) return ME;
  return usersById[id] || { id, name: 'Unknown', handle: 'unknown' };
}

/* ---------- comments ---------- */
function allComments() {
  const deleted = new Set(read(KEYS.deleted, []));
  const local = read(KEYS.comments, []);
  const localById = Object.fromEntries(local.map((c) => [c.id, c]));
  return [...seedComments.map((c) => localById[c.id] || c), ...local.filter((c) => !c.id.startsWith('seed-'))]
    .filter((c) => !deleted.has(c.id) && !deleted.has(c.parentId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getComments(articleId) {
  return allComments().filter((c) => c.articleId === articleId);
}

/** Top-level comments, each with its replies (one level, oldest first). */
export function getThread(articleId) {
  const all = getComments(articleId);
  const top = all.filter((c) => !c.parentId);
  return top.map((c) => ({ ...c, replies: all.filter((r) => r.parentId === c.id) }));
}

export function getComment(id) {
  return allComments().find((c) => c.id === id) || null;
}

/** Every post and reply across all articles, newest first (Explore). */
export function getAllPosts() {
  return allComments()
    .filter((c) => getArticle(c.articleId))
    .reverse();
}

/** The tester's own posts and replies, newest first (Profile). */
export function getMyPosts() {
  return getAllPosts().filter((c) => c.userId === ME.id);
}

export function addComment({ articleId, parentId = null, body }) {
  const comment = {
    id: 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    articleId,
    parentId,
    userId: ME.id,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  write(KEYS.comments, [...read(KEYS.comments, []), comment]);
  return comment;
}

export function editComment(id, body) {
  const local = read(KEYS.comments, []);
  write(
    KEYS.comments,
    local.map((c) => (c.id === id ? { ...c, body: body.trim(), editedAt: new Date().toISOString() } : c)),
  );
}

export function deleteComment(id) {
  write(KEYS.deleted, [...read(KEYS.deleted, []), id]);
  write(KEYS.comments, read(KEYS.comments, []).filter((c) => c.id !== id));
}

export function isReported(id) {
  return read(KEYS.reported, []).includes(id);
}
export function reportComment(id) {
  write(KEYS.reported, [...new Set([...read(KEYS.reported, []), id])]);
}

/** True when an article has at least one post (seeded or the tester's own). */
export function hasDiscussion(article) {
  return getComments(article.id).length > 0;
}

/** Latest activity: whichever is newer, the article's own date or its newest comment. */
export function getLatestActivity(article) {
  const own = article.statusDate || article.versionDate || '';
  const last = getComments(article.id).at(-1)?.createdAt || '';
  return last > own ? last : own;
}

/* ---------- small hook for pages ---------- */
export function useArticle(id) {
  useStoreVersion();
  return getArticle(id);
}

/* ---------- links between the two apps ---------- */
const BASE = import.meta.env.BASE_URL; // "/" locally, "/<repo>/" on GitHub Pages
export const links = {
  scietyHome: () => `${BASE}#/`,
  scietyArticle: (id) => `${BASE}#/articles/${encodeURIComponent(id)}`,
  discussion: (id) => `${BASE}discussions/#/articles/${encodeURIComponent(id)}`,
};
