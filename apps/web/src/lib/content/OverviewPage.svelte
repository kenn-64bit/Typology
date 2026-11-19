<script lang="ts">
  // Overview page: what the site is, the seven systems, the evidence scale and the steps.
  import Divider from "$lib/page/Divider.svelte";
  import SectionHeading from "$lib/page/SectionHeading.svelte";
  import TitleBar from "$lib/page/TitleBar.svelte";
  import { BADGES, type BadgeKey } from "./shared.ts";
  import { EVIDENCE } from "./evidence.ts";
  import "./diagram.css";

  /** One example code per system, in EVIDENCE order. */
  const CODE: Record<string, string> = {
    "/bigfive": "/R/LOA[I]", "/motives": "A|O|XIVRg", "/temperament": "phleg [dom]", "/jung": "IT(N) (TiNi)",
    "/enneagram": "127 (1w2) so/sx/sp", "/ap": "VLEF", "/temporistics": "NVBP",
  };
  const WORD: Record<BadgeKey, string> = { strong: "Strong", some: "Some", mixed: "Mixed", little: "Little" };
  const LEGEND: { key: BadgeKey; fill: number }[] = [
    { key: "strong", fill: 4 }, { key: "some", fill: 3 }, { key: "mixed", fill: 2 }, { key: "little", fill: 1 },
  ];
  const systemsAt = (k: BadgeKey) => EVIDENCE.filter(e => e.key === k).map(e => e.sys).join(" · ");
</script>

<TitleBar title="Overview" />

<div class="card">
  <SectionHeading text="What this site is" />
  <p class="lead">Typology has a test for each of seven personality systems. Each system looks at a different part of personality. Big Five and MOTIVES describe broad traits and drives. The Four Temperaments describe energy and reaction to stress. The Jungian functions describe how you take in information and decide. The Enneagram describes core fears and wants. Attitudinal Psyche and Temporistics describe your attitude to four areas of life and to time.</p>
  <p class="lead">Each system has its own page. The page explains the theory, the letter code and the evidence. Each result shows how sure the test is and which answers decided it.</p>

  <Divider />
  <SectionHeading text="The seven systems" />
  <div class="dg-scroll">
    <div class="dg-table sys" role="table" aria-label="The seven systems">
      <div class="dg-row dg-head" role="row">
        <span role="columnheader">System</span><span role="columnheader">What it describes</span>
        <span role="columnheader">Example code</span><span role="columnheader">Evidence</span>
      </div>
      {#each EVIDENCE as s (s.href)}
        <div class="dg-row" role="row">
          <a class="name" role="rowheader" href={s.href}>{s.sys}</a>
          <span role="cell">{s.lead}</span>
          <span role="cell"><code>{CODE[s.href]}</code></span>
          <span role="cell"><a href="/references#ev-{s.href.slice(1)}" title={BADGES[s.key].tip}>{WORD[s.key]}</a></span>
        </div>
      {/each}
    </div>
  </div>

  <Divider />
  <SectionHeading text="How much evidence each system has" />
  <p class="lead">The systems do not have equal support. Big Five has many independent studies. Three systems have none. Read results from those three as descriptions to check against yourself. The <a href="/references">References</a> page gives the studies and sources for each system.</p>
  <div class="legend" aria-label="Evidence scale">
    {#each LEGEND as l (l.key)}
      <div class="l-row" title={BADGES[l.key].tip}>
        <span class="l-word">{WORD[l.key].toLowerCase()}</span>
        <span class="l-bar" aria-hidden="true">{#each Array(4) as _, i (i)}<span class:on={i < l.fill}></span>{/each}</span>
        <span>{systemsAt(l.key)}</span>
      </div>
    {/each}
  </div>

  <Divider />
  <SectionHeading text="How to take the tests" />
  <ol class="steps">
    <li>Start with <a href="/bigfive"><strong>Big Five</strong></a>. The MOTIVES, Four Temperaments and Jungian tests use your Big Five scores, so they ask fewer questions.</li>
    <li>On a system page, select <strong>Take the test</strong>. All the questions show on one page.</li>
    <li>Answer every question. You can change an answer until you see your result.</li>
    <li>Read your result and the answers that decided it.</li>
    <li>Do the other tests in any order. Your results stay in this browser, so you can stop and come back later.</li>
  </ol>
</div>

<style>
  .card { border: 1px solid var(--panel-border); background: rgb(255 255 255 / 0.25); padding: 0.9rem 1rem 1rem; }
  .lead { margin: 0.2rem 0 0.8rem 1.1rem; font-size: 13px; }
  .sys .dg-row { grid-template-columns: 9rem minmax(12rem, 1fr) 8.5rem 4rem; }
  .sys .name { font: bold 12.5px var(--font-head); }
  .sys code { color: var(--rust); font-weight: bold; }
  .legend { display: grid; gap: 0.2rem; margin-left: 1.1rem; font-size: 11px; }
  .l-row { display: grid; grid-template-columns: 4.5rem auto minmax(0, 1fr); gap: 0.6rem; align-items: center; cursor: help; }
  .l-word { font: bold 10px var(--font-head); letter-spacing: 0.02em; color: var(--meta); }
  .l-bar { display: flex; gap: 2px; }
  .l-bar span { width: 18px; height: 9px; background: var(--cream-dark); }
  .l-bar span.on { background: var(--teal); }
  .steps { margin: 0 0 0 1.1rem; padding-left: 1.2rem; display: grid; gap: 0.5rem; font-size: 13px; }
  .steps li::marker { font: bold 12px var(--font-head); color: var(--teal-dark); }
  @media (max-width: 760px) {
    .sys .dg-row { grid-template-columns: minmax(0, 1fr) auto; }
    .sys .dg-row > :nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
    .sys .dg-head > :nth-child(2), .sys .dg-head > :nth-child(3) { display: none; }
    .sys .dg-row > :nth-child(3) { grid-row: 3; grid-column: 1 / -1; }
    .sys .dg-row > :nth-child(4) { grid-row: 1; grid-column: 2; }
    .l-row { grid-template-columns: 4rem auto; } .l-row > :last-child { grid-column: 1 / -1; }
  }
</style>
