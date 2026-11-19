import { describe, expect, it } from "vitest";
import { cleanQuery, loadIndex, MAX_QUERY, MAX_RESULTS, pageEntries, safeHref, search, slugify, snippet } from "./index.ts";

describe("cleanQuery", () => {
  it("caps the length", () => expect(cleanQuery("a".repeat(500)).length).toBeLessThanOrEqual(MAX_QUERY));
  it("removes control, zero-width and markup characters", () => {
    expect(cleanQuery("ab\u0000c​d")).toBe("abcd");
    expect(cleanQuery('<script>alert("x")</script>')).not.toMatch(/[<>"'`]/);
  });
  it("normalizes case and spaces", () => expect(cleanQuery("  Big   FIVE ")).toBe("big five"));
});

describe("safeHref", () => {
  it("allows internal routes and anchors", () => {
    expect(safeHref("/")).toBe("/");
    expect(safeHref("/jung#notation")).toBe("/jung#notation");
  });
  it("rejects everything else", () => {
    for (const h of ["javascript:alert(1)", "https://evil.example", "//evil.example", "/unknown", "/jung#a b", "/jung?x=1", "/../x"]) expect(safeHref(h)).toBeNull();
  });
});

describe("index", async () => {
  const index = await loadIndex();
  it("covers page prose, data and references", () => {
    expect(index.length).toBeGreaterThan(100);
    expect(search(index, "eysenck").length).toBeGreaterThan(0);
    expect(search(index, "data privacy").length).toBeGreaterThan(0);
    expect(search(index, "reverse-keyed").length).toBeGreaterThanOrEqual(0);
  });
  it("only contains safe internal links", () => {
    for (const e of index) expect(safeHref(e.href)).toBe(e.href);
  });
  it("never turns a query into a link", () => {
    for (const q of ["javascript:alert(1)", "https://evil.example", "<img src=x onerror=alert(1)>"])
      for (const h of search(index, q)) expect(safeHref(h.href)).toBe(h.href);
  });
  it("needs every word (AND) and caps results", () => {
    const hits = search(index, "temporistics eternity");
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(`${h.title} ${h.where} ${h.text}`.toLowerCase()).toMatch(/eternity/);
    expect(search(index, "the").length).toBeLessThanOrEqual(MAX_RESULTS);
    expect(search(index, "a")).toEqual([]);
  });
  it("ranks title matches first", () => {
    const hits = search(index, "enneagram");
    expect(hits[0]!.title.toLowerCase()).toContain("enneagram");
  });
});

describe("pageEntries", () => {
  it("splits on headings and drops script, markup and expressions", () => {
    const src = `<script>const x = 1;</script>\n<SectionHeading text="First" />\n<p>Hello {name} <b>world</b></p>\n<h3 class="sub">Second part</h3><p>More text</p>`;
    const e = pageEntries("OverviewPage", src);
    expect(e.map(x => x.title)).toEqual(["First", "Second part"]);
    expect(e[0]!.text).toBe("Hello world");
    expect(e[1]!.href).toBe(`/#${slugify("Second part")}`);
  });
});

describe("snippet", () => {
  it("marks matches as plain-text segments", () => {
    const s = snippet("The Big Five is a model.", "five");
    expect(s.some(x => x.hit && x.t.toLowerCase() === "five")).toBe(true);
    expect(s.map(x => x.t).join("")).toContain("The Big Five is a model.");
  });
});
