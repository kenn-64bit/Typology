import { describe, expect, it } from "vitest";
import { OPEN_HOSTS, OPEN_SITES, REFERENCES } from "./references.ts";

// Strict rule: every citation must be free and open to the public. No exceptions.
const host = (link: string) => new URL(link).hostname;
const papers = REFERENCES.find(g => g.id === "papers")!.refs;
const sites = REFERENCES.find(g => g.id === "websites")!.refs;

describe("open-access citations", () => {
  it("uses https for every link", () => {
    for (const g of REFERENCES) for (const r of g.refs) expect(r.link, r.text).toMatch(/^https:\/\//);
  });

  it("links every paper to an open full-text host", () => {
    for (const r of papers) expect(OPEN_HOSTS, `${r.text} → ${r.link}`).toContain(host(r.link));
  });

  it("links every website to a checked open site", () => {
    for (const r of sites) expect(OPEN_SITES, `${r.text} → ${r.link}`).toContain(host(r.link));
  });

  it("has only the papers and websites groups", () => {
    expect(REFERENCES.map(g => g.id)).toEqual(["papers", "websites"]);
  });
});
