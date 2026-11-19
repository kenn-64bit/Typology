import { describe, expect, it } from "vitest";
import { FLAGGED, isFlagged, OPEN_HOSTS, OPEN_SITES, REFERENCES } from "./references.ts";

// Only free, open sources. A paper links to free full text, or the site owner has it in FLAGGED.
const host = (link: string) => new URL(link).hostname;
const papers = REFERENCES.find(g => g.id === "papers")!.refs;
const sites = REFERENCES.find(g => g.id === "websites")!.refs;

describe("open-access citations", () => {
  it("uses https for every link", () => {
    for (const g of REFERENCES) for (const r of g.refs) expect(r.link, r.text).toMatch(/^https:\/\//);
  });

  it("links each paper to an open full-text host, unless the paper is flagged", () => {
    for (const r of papers) if (!isFlagged(r)) expect(OPEN_HOSTS, `${r.text} → ${r.link}`).toContain(host(r.link));
  });

  it("links each website to a checked open site", () => {
    for (const r of sites) expect(OPEN_SITES, `${r.text} → ${r.link}`).toContain(host(r.link));
  });

  it("has no stale flags", () => {
    for (const k of Object.keys(FLAGGED)) expect(papers.some(r => r.text.startsWith(k)), k).toBe(true);
  });
});
