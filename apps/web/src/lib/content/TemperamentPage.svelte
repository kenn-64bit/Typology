<script lang="ts">
  // Four Temperaments page text: CONTENT.md §5. Do not reword.
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
  facts={["4 TEMPERAMENTS", "2 TRAITS"]}
  format={hasBigFive ? "2 questions · uses your Big Five result" : "About 6–8 statements · all on one page"}
  extra="Take Big Five first. This test uses your Extraversion and Neuroticism scores. Then it asks 2 questions to check if your temperament is pure or a blend.">

  {#snippet overview()}
    <p>The four temperaments are one of the oldest personality ideas. Ancient Greek doctors thought that four body fluids controlled mood. Too much of one fluid made a person cheerful, angry, sad or slow. That medical idea is wrong. But the four names stayed in everyday language for more than 2,000 years.</p>
    <p>In the 20th century, the psychologist Hans Eysenck saw that the four names fit two modern traits. One trait is Extraversion: how outgoing you are. The other is Neuroticism: how strongly you react to stress. Put the two traits on a grid, and you get four areas. Each area matches one old temperament.</p>
    <p>So your temperament is a short name for where you sit on that grid. It describes your basic energy and how you react when things go wrong. Example: two people miss a bus. One laughs and calls a friend (Sanguine). One gets angry at the driver (Choleric). One worries about being late all day (Melancholic). One waits calmly for the next bus (Phlegmatic).</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ArrowRow>The app writes each temperament as a short form of its old name:</ArrowRow>
    <ChipRow label="sang:" href={g}><strong>Sanguine.</strong> From the Latin word for blood. Old doctors linked blood to a warm, hopeful mood. Today it means Social and Calm.</ChipRow>
    <ChipRow label="chol:" href={g}><strong>Choleric.</strong> From the Greek word for yellow bile. Old doctors linked it to anger. Today it means Social and Limbic.</ChipRow>
    <ChipRow label="mel:" href={g}><strong>Melancholic.</strong> From the Greek words for black bile. Old doctors linked it to sadness. Today it means Reserved and Limbic.</ChipRow>
    <ChipRow label="phleg:" href={g}><strong>Phlegmatic.</strong> From the Greek word for phlegm. Old doctors linked it to slowness. Today it means Reserved and Calm.</ChipRow>
    <ChipRow label="[dom]:" href={g}><strong>Pure.</strong> You sit well inside one area of the grid. No second temperament mixes in.</ChipRow>
    <ChipRow label="phleg-mel:" href={g}><strong>Blend.</strong> You sit near the line between two areas. The first name is stronger. The second name shows the area you lean toward.</ChipRow>
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
    <p class="dg-note">The grid has two lines. Left to right is emotional reactivity. Top to bottom is outgoingness. Your Big Five scores place you in one of the four areas.</p>
  {/snippet}

  {#snippet parts()}
    <ChipRow label="sang:" href={g}><strong>Sanguine (sang): Social + Calm</strong><br />You are outgoing, cheerful and active. You recover from bad moods quickly. You make friends easily and enjoy new places. You may start many things and lose interest before you finish. At a party, you are the one who talks to strangers.</ChipRow>
    <ChipRow label="chol:" href={g}><strong>Choleric (chol): Social + Limbic</strong><br />You are driven and direct. You take charge, and you can become angry quickly. You have strong opinions and a lot of energy. You push projects forward when others hesitate. You may clash with people who move slower than you.</ChipRow>
    <ChipRow label="mel:" href={g}><strong>Melancholic (mel): Reserved + Limbic</strong><br />You are thoughtful and careful. You feel things deeply and notice details. You may hold high standards for yourself and others. You remember small hurts for a long time. Art, music and deep talks can mean a lot to you.</ChipRow>
    <ChipRow label="phleg:" href={g}><strong>Phlegmatic (phleg): Reserved + Calm</strong><br />You are calm, steady and patient. Few things upset you. People find you easy to be around. You may avoid conflict and change. Others may take your calm for a lack of interest.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>The first name is your main temperament. It shows the area of the grid where you sit.</ArrowRow>
    <ArrowRow><code>[dom]</code> means you sit well inside one area of the grid. The description of that temperament likely fits you well.</ArrowRow>
    <ArrowRow>A blend such as <code>phleg-mel</code> means you sit near a line between two areas. Read both descriptions. You may show the second one under stress or with certain people.</ArrowRow>
    <ArrowRow>Your temperament comes from your Big Five Extraversion and Neuroticism. If those letters change, your temperament can change too.</ArrowRow>
    <ChipRow label="NOTE:">If your temperament does not match your SLOAN letters, the app shows a conflict note. Example: Phlegmatic means Calm, but SLOAN <code>L</code> means Limbic. You can answer extra questions to check.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>These are not Keirsey temperaments.</strong> Keirsey uses different names (Guardian, Artisan, Idealist, Rational). They come from MBTI letters, not from this grid.</ArrowRow>
    <ArrowRow><strong>Melancholic does not mean sad.</strong> Here it means thoughtful and emotionally sensitive.</ArrowRow>
    <ArrowRow><strong>Phlegmatic does not mean lazy.</strong> It means calm and steady. Many phlegmatic people work hard, without fuss.</ArrowRow>
    <ArrowRow><strong>Choleric does not mean aggressive.</strong> It means quick to react and quick to lead. Anger shows more easily, but it can also pass quickly.</ArrowRow>
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
