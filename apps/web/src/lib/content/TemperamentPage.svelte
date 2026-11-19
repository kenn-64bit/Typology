<script lang="ts">
  // Four Temperaments page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import { app } from "$lib/app.svelte.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#temperament";
  const hasBigFive = $derived("bigfive" in app.data.results);
</script>

<TypologyLayout {t} {result} title="Four Temperaments"
  facts={["4 temperaments", "placed on 2 Big Five traits"]}
  format={hasBigFive ? "2 questions. Uses your Big Five scores." : "6 to 8 statements on one page"}
  extra="If you took the Big Five test, this test uses your Extraversion and Neuroticism scores. Then 2 questions find out if your temperament is pure or a blend.">

  {#snippet overview()}
    <p>The four temperaments are one of the oldest ideas about personality. Ancient Greek doctors thought that four body fluids controlled mood. Too much of one fluid made a person cheerful, angry, sad or slow. Medicine rejected that idea, but the four names stayed in everyday language for more than 2,000 years.</p>
    <p>In the 20th century, the psychologist Hans Eysenck saw that the four names fit two modern traits. Extraversion is how outgoing you are. Neuroticism is how strongly you react to stress. When you put the two traits on a grid, you get four areas, and each area matches one old temperament.</p>
    <p>So your temperament is a short name for your position on that grid. It describes your usual energy and how you react when something goes wrong. Example: four people miss a bus. The Sanguine one laughs and calls a friend. The Choleric one is angry with the driver. The Melancholic one worries all day about being late. The Phlegmatic one waits calmly for the next bus.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ArrowRow>The code uses a short form of each old name:</ArrowRow>
    <ChipRow label="sang:" href={g}><strong>Sanguine.</strong> From the Latin word for blood. Ancient doctors linked blood to a warm, hopeful mood. Here it means Social and Calm.</ChipRow>
    <ChipRow label="chol:" href={g}><strong>Choleric.</strong> From the Greek word for yellow bile. Ancient doctors linked it to anger. Here it means Social and Limbic.</ChipRow>
    <ChipRow label="mel:" href={g}><strong>Melancholic.</strong> From the Greek words for black bile. Ancient doctors linked it to sadness. Here it means Reserved and Limbic.</ChipRow>
    <ChipRow label="phleg:" href={g}><strong>Phlegmatic.</strong> From the Greek word for phlegm. Ancient doctors linked it to slowness. Here it means Reserved and Calm.</ChipRow>
    <ChipRow label="[dom]:" href={g}><strong>Pure.</strong> Your position is well inside one area of the grid. There is no second temperament.</ChipRow>
    <ChipRow label="phleg-mel:" href={g}><strong>Blend.</strong> Your position is near the line between two areas. The first name is stronger. The second name is the area you are near.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="tg" role="table" aria-label="Temperament grid: Extraversion by Neuroticism">
      <span></span>
      <span class="dg-label top axis" role="columnheader">Neuroticism (emotional reactivity)</span>
      <span class="dg-label corner">Extraversion</span>
      <span class="dg-label top" role="columnheader">LOW (Calm) <a class="dg-letter" href="/bigfive">C</a></span>
      <span class="dg-label top" role="columnheader">HIGH (Limbic) <a class="dg-letter" href="/bigfive">L</a></span>
      <span class="dg-label side" role="rowheader">HIGH (Social) <a class="dg-letter" href="/bigfive">S</a></span>
      <a class="cell" href={g} role="cell"><b>SANGUINE</b>cheerful · active<br />easy to talk to</a>
      <a class="cell" href={g} role="cell"><b>CHOLERIC</b>driven · quick to<br />anger · leads</a>
      <span class="dg-label side" role="rowheader">LOW (Reserved) <a class="dg-letter" href="/bigfive">R</a></span>
      <a class="cell" href={g} role="cell"><b>PHLEGMATIC</b>calm · steady<br />patient</a>
      <a class="cell" href={g} role="cell"><b>MELANCHOLIC</b>thoughtful · deep<br />feelings · careful</a>
    </div>
    <p class="dg-note">The columns are Neuroticism, from low to high. The rows are Extraversion, from high to low. Your two Big Five scores put you in one of the four areas.</p>
  {/snippet}

  {#snippet parts()}
    <ChipRow label="sang:" href={g}><strong>Sanguine (sang): Social + Calm</strong><br />You are outgoing, cheerful and active. A bad mood does not last long. You make friends easily and enjoy new places. You may start many things and lose interest before you finish them. At a party, you talk to people you do not know.</ChipRow>
    <ChipRow label="chol:" href={g}><strong>Choleric (chol): Social + Limbic</strong><br />You are driven and direct. You take control, and you can become angry quickly. You have strong opinions and a lot of energy. When other people hesitate, you push the work forward. You may argue with people who move more slowly than you.</ChipRow>
    <ChipRow label="mel:" href={g}><strong>Melancholic (mel): Reserved + Limbic</strong><br />You are thoughtful and careful. You feel things strongly and see details. You may set high standards for yourself and for others. You remember a small hurt for a long time. Art, music and serious conversation can mean a lot to you.</ChipRow>
    <ChipRow label="phleg:" href={g}><strong>Phlegmatic (phleg): Reserved + Calm</strong><br />You are calm, steady and patient. Few things upset you, and people find you easy company. You may avoid conflict and change. Other people can mistake your calm for a lack of interest.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>The first name is your main temperament: the area of the grid you are in.</ArrowRow>
    <ArrowRow><code>[dom]</code> means your position is well inside one area. The description of that temperament probably fits you well.</ArrowRow>
    <ArrowRow>A blend such as <code>phleg-mel</code> means your position is near the line between two areas. Read both descriptions. The second one may show under stress or with some people.</ArrowRow>
    <ArrowRow>Your temperament comes from your Extraversion and Neuroticism scores. If those scores change, your temperament can change too.</ArrowRow>
    <ChipRow label="note:">The result shows your Extraversion and Neuroticism percentiles. It also says if they came from your Big Five result or from this test's own questions.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>These are not the Keirsey temperaments.</strong> Keirsey uses other names (Guardian, Artisan, Idealist, Rational), which come from MBTI letters, not from this grid.</ArrowRow>
    <ArrowRow><strong>Melancholic does not mean sad.</strong> Here it means thoughtful and emotionally sensitive.</ArrowRow>
    <ArrowRow><strong>Phlegmatic does not mean lazy.</strong> It means calm and steady. Many phlegmatic people work hard and do not complain.</ArrowRow>
    <ArrowRow><strong>Choleric does not mean aggressive.</strong> It means quick to react and quick to lead. Anger shows more easily, but it also goes quickly.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .tg { display: grid; grid-template-columns: 7rem minmax(0, 1fr) minmax(0, 1fr); gap: 4px; font: 12.5px/1.45 var(--font-body); max-width: 40rem; margin: 0 auto; }
  .top { text-align: center; padding-bottom: 0.2rem; }
  .side { align-self: center; }
  .axis { grid-column: span 2; border-bottom: 1px solid var(--panel-border); }
  .corner { align-self: end; color: var(--meta); padding-bottom: 0.2rem; }
  .tg :global(.dg-letter) { font-size: 11px; min-width: 1.3rem; margin-left: 0.2rem; }
  .cell { display: grid; gap: 0.2rem; padding: 0.8rem; text-align: center; color: var(--text); background: var(--white); border: 1px solid var(--panel-border); }
  .cell b { color: var(--rust); letter-spacing: 0.06em; }
  .cell:hover { text-decoration: none; background: var(--cream-dark); }
  @media (max-width: 760px) { .tg { grid-template-columns: 5rem 1fr 1fr; font-size: 11.5px; } .cell { padding: 0.5rem; } }
</style>
