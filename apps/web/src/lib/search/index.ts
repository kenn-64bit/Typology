// Site search: a small in-browser index over all readable content, plus safe query handling.
// Security rules: user input is only ever compared as plain text (no regex, no HTML), and every
// result link comes from the site's own data and must pass the internal-route allow-list.
import { GLOSSARY } from "$lib/glossary.ts";
import { GLOSSARY_PAGES } from "$lib/content/glossaryContent.ts";
import { EVIDENCE } from "$lib/content/evidence.ts";
import { REFERENCES } from "$lib/content/references.ts";
import { TYPOLOGIES } from "$lib/typologies.ts";

export const MAX_QUERY = 64;
export const MAX_RESULTS = 12;

export interface Entry { title: string; where: string; href: string; text: string }
export interface Hit extends Entry { score: number }

/** Heading text → anchor id. Used for both the index and the ids added to headings on the page. */
export function slugify(s: string): string {
  return s.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const ROUTES = new Set(["/", "/glossary", "/references", ...TYPOLOGIES.map(t => `/${t.slug}`)]);
const HREF = /^(\/[a-z0-9-]*)(#[a-z0-9-]+)?$/;
/** Only internal routes, optionally with a plain #anchor. Anything else is rejected. */
export function safeHref(h: string): string | null {
  const m = HREF.exec(h);
  return m && ROUTES.has(m[1]!) ? h : null;
}

/** Clean a raw query: cap the length, normalize, drop control/zero-width chars and markup characters. */
export function cleanQuery(raw: string): string {
  return raw.slice(0, MAX_QUERY).normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, "")
    .replace(/[<>"'`]/g, " ")
    .replace(/\s+/g, " ").trim().toLowerCase().slice(0, MAX_QUERY);
}

// ---- page prose: read the page components' source and keep only the visible text ----
const PAGE_ROUTE: Record<string, [string, string]> = {
  BigFivePage: ["/bigfive", "Big Five / SLOAN"], MotivesPage: ["/motives", "MOTIVES"], TemperamentPage: ["/temperament", "Four Temperaments"],
  JungPage: ["/jung", "Jungian Functions"], EnneagramPage: ["/enneagram", "Enneagram"], APPage: ["/ap", "Attitudinal Psyche"],
  TemporisticsPage: ["/temporistics", "Temporistics"], OverviewPage: ["/", "Overview"], GlossaryPage: ["/glossary", "Glossary"], ReferencesPage: ["/references", "References"],
};
// TypologyLayout renders these snippets under fixed headings.
const SNIPPET_HEAD: Record<string, string> = {
  overview: "Overview", notation: "Notation", figure: "What it measures", parts: "What each letter means", read: "How to read your result", mixups: "Common mix-ups",
};

function visibleText(src: string): string {
  let s = src;
  for (let i = 0; i < 6 && /\{[^{}]*\}/.test(s); i++) s = s.replace(/\{[^{}]*\}/g, " ");
  return s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
}

export function pageEntries(file: string, src: string): Entry[] {
  const route = PAGE_ROUTE[file];
  if (!route) return [];
  const [base, where] = route;
  const body = src.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  const marker = /\{#snippet (\w+)\(|<SectionHeading text="([^"]+)"[^>]*>|<h3 class="sub"[^>]*>([\s\S]*?)<\/h3>/g;
  const out: Entry[] = [];
  let head = where, anchor = "", last = 0, m: RegExpExecArray | null;
  const push = (end: number) => {
    const text = visibleText(body.slice(last, end));
    if (text.length > 1) out.push({ title: head, where, href: anchor ? `${base}#${anchor}` : base, text });
  };
  while ((m = marker.exec(body))) {
    push(m.index);
    const h = m[1] ? SNIPPET_HEAD[m[1]] ?? where : m[2] ?? visibleText(m[3] ?? "");
    head = h; anchor = slugify(h); last = marker.lastIndex;
  }
  push(body.length);
  return out;
}

// ---- structured data ----
function dataEntries(): Entry[] {
  const e: Entry[] = [];
  for (const t of TYPOLOGIES) e.push({ title: t.navName, where: "System", href: `/${t.slug}`, text: [t.summary, t.measures, ...t.notation, t.caveat].join(" ") });
  for (const g of GLOSSARY) for (const grp of g.groups) for (const [k, v] of grp.rows)
    e.push({ title: k, where: `Glossary · ${g.title}`, href: `/glossary#${g.id}`, text: v });
  for (const p of GLOSSARY_PAGES) for (const [tok, name, meaning] of p.rows)
    e.push({ title: `${tok}: ${name}`, where: `Glossary · ${p.system}`, href: `/glossary#${p.id}`, text: meaning });
  for (const a of EVIDENCE) e.push({ title: `Evidence: ${a.sys}`, where: "References", href: `/references#ev-${a.href.slice(1)}`, text: `${a.lead} ${a.ev}` });
  for (const g of REFERENCES) for (const r of g.refs)
    e.push({ title: [r.text, r.title].filter(Boolean).join(" "), where: `References · ${g.title}`, href: `/references#${g.id}`, text: r.rest ?? "" });
  e.push({ title: "Privacy", where: "Footer", href: "/", text: "Your answers stay in this browser. Nothing goes to a server. Data Privacy Act of 2012 (Republic Act No. 10173). A result describes preferences. It does not measure ability or mental health." });
  return e;
}

/** Builds the full index (lazy: page sources are loaded on first use). Entries with unsafe links are dropped. */
let cache: Promise<Entry[]> | null = null;
export function loadIndex(): Promise<Entry[]> {
  cache ??= (async () => {
    const mods = import.meta.glob("$lib/content/*Page.svelte", { query: "?raw", import: "default" });
    const pages = await Promise.all(Object.entries(mods).map(async ([path, load]) => {
      const file = path.split("/").pop()!.replace(".svelte", "");
      return pageEntries(file, String(await load()));
    }));
    return [...dataEntries(), ...pages.flat()].flatMap(x => { const href = safeHref(x.href); return href ? [{ ...x, href }] : []; });
  })();
  return cache;
}

/** All words must match (AND). Ranking: title, then exact token, then body. */
export function search(index: Entry[], query: string): Hit[] {
  const q = cleanQuery(query);
  if (q.length < 2) return [];
  const words = q.split(" ");
  const hits: Hit[] = [];
  for (const x of index) {
    const title = x.title.toLowerCase(), hay = `${title} ${x.where.toLowerCase()} ${x.text.toLowerCase()}`;
    if (!words.every(w => hay.includes(w))) continue;
    const tokens = new Set(title.split(/[\s:·,()]+/));
    let score = title === q ? 40 : 0;
    for (const w of words) score += tokens.has(w) ? 12 : title.includes(w) ? 8 : 1;
    hits.push({ ...x, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.length - b.title.length).slice(0, MAX_RESULTS);
}

/** A short excerpt around the first match, split into plain-text segments; `hit` segments are shown highlighted. */
export function snippet(text: string, query: string, span = 70): { t: string; hit: boolean }[] {
  const words = cleanQuery(query).split(" ").filter(w => w.length > 0);
  const low = text.toLowerCase();
  const first = Math.min(...words.map(w => low.indexOf(w)).filter(i => i >= 0), Infinity);
  const start = Number.isFinite(first) ? Math.max(0, first - Math.floor(span / 2)) : 0;
  const end = Math.min(text.length, start + span * 2);
  const part = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  const pl = part.toLowerCase();
  const segs: { t: string; hit: boolean }[] = [];
  let i = 0;
  while (i < part.length) {
    let best = -1, len = 0;
    for (const w of words) { const k = pl.indexOf(w, i); if (k >= 0 && (best < 0 || k < best)) { best = k; len = w.length; } }
    if (best < 0) { segs.push({ t: part.slice(i), hit: false }); break; }
    if (best > i) segs.push({ t: part.slice(i, best), hit: false });
    segs.push({ t: part.slice(best, best + len), hit: true });
    i = best + len;
  }
  return segs;
}
