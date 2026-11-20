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
  const FILL = Object.fromEntries(LEGEND.map(l => [l.key, l.fill])) as Record<BadgeKey, number>;
  const systemsAt = (k: BadgeKey) => EVIDENCE.filter(e => e.key === k).map(e => e.sys).join(" · ");
</script>

<TitleBar title="Overview" />

<div class="card">
  <SectionHeading text="What this site is" />
  <p class="lead">Typology has a test for each of seven personality systems. Each system looks at a different part of personality. Big Five and MOTIVES describe broad traits and drives. The Four Temperaments describe energy and reaction to stress. The Jungian functions describe how you take in information and decide. The Enneagram describes core fears and wants. Attitudinal Psyche and Temporistics describe your attitude to four areas of life and to time.</p>
  <p class="lead">Each system has its own page. The page explains the theory, the letter code and the evidence. Each result shows how sure the test is and which answers decided it.</p>

  <Divider />
  <SectionHeading text="The seven systems" />
  <table class="fx sys">
    <caption class="sr">The seven systems: what each describes, an example code and how much evidence supports it</caption>
    <thead>
      <tr><th scope="col" class="fx-k">System</th><th scope="col" class="fx-k">Example code</th><th scope="col" class="fx-k">What it describes</th><th scope="col" class="fx-k">Evidence</th></tr>
    </thead>
    <tbody>
      {#each EVIDENCE as s (s.href)}
        {@const fill = FILL[s.key]}
        <tr>
          <th scope="row"><a class="name" href={s.href}>{s.sys}</a></th>
          <td class="code"><code>{CODE[s.href]}</code></td>
          <td class="desc">{s.lead}</td>
          <td class="ev"><a href="/references#ev-{s.href.slice(1)}" title={BADGES[s.key].tip}><span class="bar" aria-hidden="true">{#each Array(4) as _, i (i)}<span class:on={i < fill}></span>{/each}</span>{WORD[s.key]}</a></td>
        </tr>
      {/each}
    </tbody>
  </table>

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
    <li>Start with <a href="/bigfive"><strong>Big Five</strong></a>. The Four Temperaments test can use your Big Five scores. MOTIVES is scored on its own answers.</li>
    <li>On a system page, select the <strong>Test</strong> button. All the questions show on one page.</li>
    <li>Answer every question. You can change an answer until you see your result.</li>
    <li>Read your result and the answers that decided it.</li>
    <li>Do the other tests in any order. Your results stay in this browser, so you can stop and come back later.</li>
  </ol>
</div>

<style>
  .card { border: 1px solid var(--panel-border); background: rgb(255 255 255 / 0.25); padding: 0.9rem 1rem 1rem; }
  .lead { margin: 0.2rem 0 0.8rem 1.1rem; font-size: var(--fs-md); }
  /* The seven systems: rows sit on the page; one hairline between rows. Teal = links, rust = codes, text colour = evidence. */
  .sys { width: 100%; border-collapse: collapse; margin-top: var(--fx-2); }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .sys th, .sys td { padding: var(--fx-3) var(--fx-4) var(--fx-3) 0; text-align: left; vertical-align: baseline; border-top: 1px solid var(--fx-line); }
  .sys :is(th, td):last-child { padding-right: 0; }
  .sys thead th { border-top: 0; padding-top: 0; padding-bottom: var(--fx-2); }
  .sys tbody tr:first-child > * { border-top-color: var(--tan); }
  .name { font: bold var(--fs-md) var(--font-head); color: var(--text); text-decoration: none; white-space: nowrap; }
  .name::after { content: " →"; color: var(--teal-dark); opacity: 0; transition: opacity var(--dur-fast); }
  .name:is(:hover, :focus-visible) { color: var(--teal-dark); text-decoration: underline; text-underline-offset: 3px; }
  .name:is(:hover, :focus-visible)::after { opacity: 1; }
  .code code { font: bold var(--fs-md) var(--font-mono); letter-spacing: 0.04em; color: var(--rust); white-space: nowrap; }
  .desc { font-size: var(--fs-base); color: var(--meta); }
  .ev { white-space: nowrap; }
  .ev a { display: inline-flex; align-items: center; gap: var(--fx-2); font-size: var(--fs-base); color: var(--text); text-decoration: none; }
  .ev a:is(:hover, :focus-visible) { color: var(--teal-dark); text-decoration: underline; }
  .bar { display: inline-flex; gap: 2px; }
  .bar span { width: 10px; height: 6px; background: var(--cream-dark); }
  .bar span.on { background: var(--text); }
  .legend { display: grid; gap: 0.2rem; margin-left: 1.1rem; font-size: var(--fs-sm); }
  .l-row { display: grid; grid-template-columns: 4.5rem auto minmax(0, 1fr); gap: 0.6rem; align-items: center; cursor: help; }
  .l-word { font: bold var(--fs-xs) var(--font-head); letter-spacing: 0.02em; color: var(--meta); }
  .l-bar { display: flex; gap: 2px; }
  .l-bar span { width: 18px; height: 9px; background: var(--cream-dark); }
  .l-bar span.on { background: var(--text); }
  .steps { margin: 0 0 0 1.1rem; padding-left: 1.2rem; display: grid; gap: 0.5rem; font-size: var(--fs-md); }
  .steps li::marker { font: bold var(--fs-base) var(--font-head); color: var(--teal-dark); }
  @media (max-width: 760px) {
    .sys, .sys tbody, .sys tr, .sys th, .sys td { display: block; }
    .sys thead { display: none; }
    .sys tr { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: var(--fx-3); padding: var(--fx-3) 0; border-top: 1px solid var(--fx-line); }
    .sys tbody tr:first-child { border-top-color: var(--tan); }
    .sys th, .sys td { padding: 0; border: 0; }
    .sys .ev { grid-column: 2; grid-row: 1; }
    .sys .code, .sys .desc { grid-column: 1 / -1; margin-top: var(--fx-1); }
    .l-row { grid-template-columns: 4rem auto; } .l-row > :last-child { grid-column: 1 / -1; }
  }
</style>
