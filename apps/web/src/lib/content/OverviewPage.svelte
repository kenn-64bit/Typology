<script lang="ts">
  // Overview page text: CONTENT.md §2 (+ evidence legend from §1.1). Do not reword.
  import Divider from "$lib/page/Divider.svelte";
  import InfoRow from "$lib/page/InfoRow.svelte";
  import SectionHeading from "$lib/page/SectionHeading.svelte";
  import TitleBar from "$lib/page/TitleBar.svelte";
  import { BADGES, type BadgeKey } from "./shared.ts";
  import { EVIDENCE } from "./evidence.ts";

  const BIO = [
    { tok: "IT(N) (TiNi)", sys: "Jungian Functions", href: "/jung" },
    { tok: "so/sx/sp", sys: "Enneagram instincts", href: "/enneagram" },
    { tok: "127 (1w2)", sys: "Enneagram tritype + core/wing", href: "/enneagram" },
    { tok: "phleg [dom]", sys: "Four Temperaments", href: "/temperament" },
    { tok: "NVBP", sys: "Temporistics", href: "/temporistics" },
    { tok: "VLEF", sys: "AP", href: "/ap" },
    { tok: "/R/LOA[I]", sys: "Big Five / SLOAN", href: "/bigfive" },
    { tok: "A|O|XIVRg", sys: "MOTIVES", href: "/motives" },
  ];
  const LEGEND: { key: BadgeKey; word: string; fill: number; systems: string }[] = [
    { key: "strong", word: "STRONG", fill: 4, systems: "Big Five / SLOAN" },
    { key: "some", word: "SOME", fill: 3, systems: "Jungian Functions · Four Temperaments" },
    { key: "mixed", word: "MIXED", fill: 2, systems: "Enneagram" },
    { key: "little", word: "LITTLE", fill: 1, systems: "MOTIVES · Attitudinal Psyche · Temporistics" },
  ];
  const SYSTEMS = [
    { step: "1", color: "--teal", icon: "M8 1l2 4.5 5 .5-3.8 3.3L12.4 14 8 11.4 3.6 14l1.2-4.7L1 6l5-.5z", sys: "Big Five / SLOAN", href: "/bigfive", what: "Five broad traits", tok: "/R/LOA[I]", res: "Strong" },
    { step: "2", color: "--rust", icon: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z", sys: "MOTIVES", href: "/motives", what: "Seven traits that drive behavior", tok: "A|O|XIVRg", res: "Little" },
    { step: "3", color: "--tan", icon: "M8 1C10 4 12 6 12 9.5A4 4 0 0 1 4 9.5C4 7 6 6 6 4c1 1 1.5 2 1.5 3C8.5 5.5 8.5 3 8 1z", sys: "Four Temperaments", href: "/temperament", what: "Your energy and emotional reactivity", tok: "phleg [dom]", res: "Some" },
    { step: "4", color: "--teal-dark", icon: "M8 2C4 2 1.5 5 1 8c.5 3 3 6 7 6s6.5-3 7-6c-.5-3-3-6-7-6zm0 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z", sys: "Jungian Functions", href: "/jung", what: "How you take in information and decide", tok: "IT(N) (TiNi)", res: "Some" },
    { step: "5", color: "--rust", icon: "M8 1l6.7 4.9-2.6 7.9H3.9L1.3 5.9zm0 2.5L3.6 6.7l1.7 5.1h5.4l1.7-5.1z", sys: "Enneagram", href: "/enneagram", what: "Core motivation, instincts and tritype", tok: "127 (1w2) · so/sx/sp", res: "Mixed" },
    { step: "6", color: "--teal", icon: "M7.2 1h1.6v2.5l4.7 1.2-2 5h-3a2 2 0 0 1-1 0h-3l-2-5 4.7-1.2zm-4 4.6L2 8.7h2.6zm9.6 0L11.4 8.7H14zM5 13h6v1.5H5z", sys: "Attitudinal Psyche", href: "/ap", what: "Your attitude to will, logic, emotion and body", tok: "VLEF", res: "Little" },
    { step: "7", color: "--tan", icon: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.6a5.4 5.4 0 1 1 0 10.8A5.4 5.4 0 0 1 8 2.6zM7.2 4h1.6v3.7l2.6 1.6-.8 1.3-3.4-2z", sys: "Temporistics", href: "/temporistics", what: "Your relationship to past, present, future and eternity", tok: "NVBP", res: "Little" },
  ];
</script>

<TitleBar title="Overview" />

<div class="card">
  <SectionHeading icon="overview" text="Overview" />
  <p class="lead">Typology is a web app that helps you describe your personality in seven typology systems. Each system looks at you from a different angle. Some describe broad traits, some describe motives, and some describe how you think, feel or relate to time.</p>
  <p class="lead">Why use it? People who use typology often write a short bio that sums up their types in one line. Building that bio by hand means taking many separate tests on many sites. Typology puts all seven tests in one place and joins the results for you.</p>
  <p class="lead">What do you get? You get one personality bio, like the example below. Each part of the bio comes from one test. Each result also shows how sure the test is and how much evidence supports the system.</p>
  <p class="lead">How does it work? You take one short test per system. After each test, you read your result and the reasons for it. Then you add it to your bio. You can stop at any time and come back later.</p>

  <Divider />
  <SectionHeading icon="info" text="About" />
  <InfoRow facts={["7 SYSTEMS", "1 BIO", "ONE TEST PER SYSTEM"]} />
  <p class="lead">Typology helps you find your type in seven personality systems. Each test adds one part to your personality bio.</p>
  <div class="legend" aria-label="Evidence scale">
    {#each LEGEND as l (l.key)}
      <div class="l-row" title={BADGES[l.key].tip}>
        <span class="l-word">{l.word}</span>
        <span class="l-bar" aria-hidden="true">{#each Array(4) as _, i (i)}<span class:on={i < l.fill}></span>{/each}</span>
        <span>{l.systems}</span>
      </div>
    {/each}
  </div>

  <Divider />
  <SectionHeading icon="chart" text="What it measures" />
  <ol class="bio" aria-label="An example bio">
    {#each BIO as b (b.tok)}
      <li><a href={b.href}><code>{b.tok}</code></a><span class="sys">{b.sys}</span></li>
    {/each}
  </ol>
  <p class="caption">An example bio. Each group of letters comes from one test.</p>

  <Divider />
  <SectionHeading icon="puzzle" text="The seven systems" />
  <ul class="dir" aria-label="The seven systems">
    {#each SYSTEMS as s (s.step)}
      <li class="tile">
        <a class="ico" href={s.href} style="--c: var({s.color})" aria-hidden="true" tabindex="-1">
          <svg viewBox="0 0 16 16" width="22" height="22"><path d={s.icon} fill="currentColor" fill-rule="evenodd" /></svg>
          <span class="num">{s.step}</span>
        </a>
        <div class="body">
          <a class="t" href={s.href}>{s.sys}</a>
          <span class="what">{s.what}.</span>
          <span class="subs"><a href={s.href}><code>{s.tok}</code></a>, <span class="meta-inline">Evidence:</span> <a href="/references#ev-{s.href.slice(1)}">{s.res}</a></span>
        </div>
      </li>
    {/each}
  </ul>

  <Divider />
  <SectionHeading icon="info" text="About each system" />
  {#each EVIDENCE as a (a.href)}
    <div class="about">
      <h3 class="a-head"><a href={a.href}>{a.sys}</a></h3>
      <p>{a.lead}</p>
    </div>
  {/each}
  <p class="caption">The evidence for each system and its sources are on the <a href="/references">References</a> page.</p>

  <Divider />
  <SectionHeading icon="book" text="How it works" />
  <ol class="steps">
    <li>Pick a test. Start with <strong>Big Five</strong>. Other tests use its result.</li>
    <li>Answer all the questions on the page.</li>
    <li>Read your result and the reasons for it.</li>
    <li>Add the result to your bio.</li>
    <li>Repeat for the other tests. Your bio fills in, one part at a time.</li>
  </ol>

</div>

<style>
  .card { border: 1px solid var(--panel-border); background: rgb(255 255 255 / 0.25); padding: 0.9rem 1rem 1rem; }
  .lead { margin: 0.2rem 0 0.8rem 1.1rem; font-size: 13px; }
  .legend { display: grid; gap: 0.2rem; margin-left: 1.1rem; font-size: 11px; }
  .l-row { display: grid; grid-template-columns: 4.5rem auto minmax(0, 1fr); gap: 0.6rem; align-items: center; cursor: help; }
  .l-word { font: bold 10px var(--font-head); letter-spacing: 0.08em; color: var(--meta); }
  .l-bar { display: flex; gap: 2px; }
  .l-bar span { width: 18px; height: 9px; background: var(--cream-dark); }
  .l-bar span.on { background: var(--teal); }
  .bio { list-style: none; margin: 0; padding: 0.6rem; display: flex; flex-wrap: wrap; gap: 0.5rem 0.9rem; background: #fffaf4; border: 1px solid var(--panel-border); }
  .bio li { width: 8.5rem; display: grid; justify-items: center; gap: 0.15rem; padding-top: 0.1rem; }
  .bio code { font-size: 14px; font-weight: bold; color: var(--rust); padding-bottom: 0.2rem; border-bottom: 2px solid var(--tan); }
  .bio a:hover { text-decoration: none; }
  .sys { font-size: 10px; color: var(--meta); text-align: center; line-height: 1.3; }
  .about { margin: 0 0 0.9rem 1.1rem; font-size: 13px; }
  .about p { margin: 0 0 0.35rem; }
  .a-head { font: bold 14px var(--font-head); margin: 0 0 0.25rem; }
  .caption { font-size: 11px; color: var(--meta); margin: 0.4rem 0 0; }
  .meta-inline { color: var(--meta); font-size: 11px; }
  .dir { list-style: none; margin: 0; padding: 0.7rem 0.8rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.2rem 1.2rem;
    background: #fff; border: 1px solid var(--panel-border); line-height: 22px; }
  .tile { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.35rem 0; }
  .ico { position: relative; flex: none; display: grid; place-items: center; width: 38px; height: 38px; color: #fff; background: var(--c); border-radius: 6px; box-shadow: 1px 2px 0 rgb(0 0 0 / 0.18);
    transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out); }
  @media (hover: hover) { .tile:hover .ico { transform: translateY(-1px); box-shadow: 1px 3px 0 rgb(0 0 0 / 0.18); } }
  .steps { list-style: none; counter-reset: step; margin: 0 0 0 1.1rem; padding: 0; display: grid; gap: 0.5rem; font-size: 13px; }
  .steps li { counter-increment: step; position: relative; padding-left: 1.75rem; }
  .steps li::before { content: counter(step); position: absolute; left: 0; top: 1px; width: 18px; font: bold 10px/16px var(--font-head); text-align: center; color: var(--teal-dark); background: #fff; border: 1px solid var(--teal-dark); border-radius: 50%; }
  .ico .num { position: absolute; right: -5px; bottom: -5px; font: bold 10px/16px var(--font-head); width: 16px; text-align: center; background: #fff; color: var(--c); border: 1px solid var(--c); border-radius: 50%; }
  .body { display: flex; flex-direction: column; min-width: 0; font-size: 12px; }
  .t, .t:hover { font: bold 14px/22px var(--font-head); text-decoration: none; }
  .subs a { text-decoration: underline; }
  .subs code { font-size: 11px; }
  @media (max-width: 760px) { .dir { grid-template-columns: 1fr; } .bio li { width: calc(50% - 0.45rem); } }
  @media (max-width: 760px) { .l-row { grid-template-columns: 4rem auto; } .l-row > :last-child { grid-column: 1 / -1; } }
</style>
