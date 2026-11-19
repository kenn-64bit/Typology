<script lang="ts">
  // Four Temperaments page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import { app } from "$lib/app.svelte.ts";
  import { importableBigFive } from "@typo/engine-temperament";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#temperament";
  const hasBigFive = $derived(importableBigFive(app.data.results) !== null);
</script>

<TypologyLayout {t} {result} title="Four Temperaments"
  facts={["4 temperaments", "placed on 2 Big Five traits"]}
  format={hasBigFive ? "1 ranking question. Uses your Big Five scores." : "8 statements and 1 ranking on one page"}
  extra="If you took the Big Five test, this test uses your Extraversion and Neuroticism scores and asks you only to rank four descriptions.">

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
    <ChipRow label="[dom]:" href={g}><strong>One area strongly favoured.</strong> The model is fairly sure which area of the grid you are in: any other area has under a 20% chance. This is about certainty. It does not mean you are far inside the area.</ChipRow>
    <ChipRow label="phleg-mel:" href={g}><strong>Blend.</strong> Two areas both remain plausible. The first is more likely. This can happen when your point is near the line between them or when your scores are less precise.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <div class="tg" role="table" aria-label="Temperament grid: Extraversion by Neuroticism">
        <span></span>
        <span class="fx-k axis" role="columnheader">Neuroticism (emotional reactivity)</span>
        <span class="fx-k corner">Extraversion</span>
        <span class="fx-k top" role="columnheader">Low (Calm) <a class="lt" href="/bigfive">C</a></span>
        <span class="fx-k top" role="columnheader">High (Limbic) <a class="lt" href="/bigfive">L</a></span>
        <span class="fx-k side" role="rowheader">High (Social) <a class="lt" href="/bigfive">S</a></span>
        <a class="q tl" href={g} role="cell"><b>Sanguine</b>cheerful · active<br />easy to talk to</a>
        <a class="q tr" href={g} role="cell"><b>Choleric</b>driven · quick to<br />anger · leads</a>
        <span class="fx-k side" role="rowheader">Low (Reserved) <a class="lt" href="/bigfive">R</a></span>
        <a class="q bl" href={g} role="cell"><b>Phlegmatic</b>calm · steady<br />patient</a>
        <a class="q" href={g} role="cell"><b>Melancholic</b>thoughtful · deep<br />feelings · careful</a>
      </div>
      <p class="fx-cap">Your Extraversion and Neuroticism scores place you in one quadrant.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <ChipRow label="sang:" href={g}><strong>Sanguine (sang): Social + Calm</strong><br />You are outgoing, cheerful and active. A bad mood does not last long. You make friends easily and enjoy new places. You may start many things and lose interest before you finish them. At a party, you talk to people you do not know.</ChipRow>
    <ChipRow label="chol:" href={g}><strong>Choleric (chol): Social + Limbic</strong><br />You are driven and direct. You take control, and you can become angry quickly. You have strong opinions and a lot of energy. When other people hesitate, you push the work forward. You may argue with people who move more slowly than you.</ChipRow>
    <ChipRow label="mel:" href={g}><strong>Melancholic (mel): Reserved + Limbic</strong><br />You are thoughtful and careful. You feel things strongly and see details. You may set high standards for yourself and for others. You remember a small hurt for a long time. Art, music and serious conversation can mean a lot to you.</ChipRow>
    <ChipRow label="phleg:" href={g}><strong>Phlegmatic (phleg): Reserved + Calm</strong><br />You are calm, steady and patient. Few things upset you, and people find you easy company. You may avoid conflict and change. Other people can mistake your calm for a lack of interest.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>The first name is your main temperament: the area of the grid you are in.</ArrowRow>
    <ArrowRow><code>[dom]</code> means the model is fairly sure which area you are in. The result also says if your point is close to an edge.</ArrowRow>
    <ArrowRow>A blend such as <code>phleg-mel</code> means two areas both remain plausible. Read both descriptions.</ArrowRow>
    <ArrowRow>Your temperament comes from your Extraversion and Neuroticism scores. If those scores change, your temperament can change too.</ArrowRow>
    <ChipRow label="note:">The result shows your Extraversion and Neuroticism percentiles and says if they came from your Big Five result or from this test's own questions. It also says if your description ranking agrees with your scores.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>These are not the Keirsey temperaments.</strong> Keirsey uses other names (Guardian, Artisan, Idealist, Rational), which come from MBTI letters, not from this grid.</ArrowRow>
    <ArrowRow><strong>Melancholic does not mean sad.</strong> Here it means thoughtful and emotionally sensitive.</ArrowRow>
    <ArrowRow><strong>Phlegmatic does not mean lazy.</strong> It means calm and steady. Many phlegmatic people work hard and do not complain.</ArrowRow>
    <ArrowRow><strong>Choleric does not mean aggressive.</strong> It means quick to react and quick to lead. Anger shows more easily, but it also goes quickly.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .tg { display: grid; grid-template-columns: 8rem minmax(0, 1fr) minmax(0, 1fr); max-width: 40rem; margin: 0 auto; }
  .axis { grid-column: span 2; text-align: center; color: var(--text); padding-bottom: var(--fx-2); }
  .corner { align-self: end; padding-bottom: var(--fx-2); }
  .top { text-align: center; padding-bottom: var(--fx-2); }
  .side { align-self: center; padding-right: var(--fx-3); }
  .tg .lt { margin-left: var(--fx-1); }
  .q { display: grid; gap: var(--fx-1); padding: var(--fx-4) var(--fx-3); text-align: center; color: var(--meta); font-size: var(--fs-base); }
  .q b { font: bold var(--fs-lg) var(--font-head); letter-spacing: 0.02em; text-transform: lowercase; color: var(--text); }
  .q:hover { text-decoration: none; }
  .q:hover b { color: var(--rust); }
  .tl, .tr { border-bottom: 1px solid var(--fx-line); }
  .tl, .bl { border-right: 1px solid var(--fx-line); }
  @media (max-width: 760px) {
    .tg { grid-template-columns: 4.6rem minmax(0, 1fr) minmax(0, 1fr); }
    .side { font-size: var(--fs-xs); padding-right: var(--fx-2); }
    .q { padding: var(--fx-3) var(--fx-2); font-size: var(--fs-sm); }
    .q b { font-size: var(--fs-base); }
  }
</style>
