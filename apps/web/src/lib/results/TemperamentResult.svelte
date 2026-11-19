<script lang="ts">
  // Breakdown = the same Extraversion × Neuroticism quadrant as the info page, with your point and each area's probability.
  import type { TemperamentResult } from "@typo/engine-temperament";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  let { r, answered }: { r: TemperamentResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const ORD = ["", "first", "second", "third", "last"];
  const CELLS = [["sanguine", "tl"], ["choleric", "tr"], ["phlegmatic", "bl"], ["melancholic", "br"]] as const;
</script>

<Header code={r.token} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  <div class="tq">
    <span></span><span class="rs-k ax">Neuroticism: low · high</span>
    <span class="rs-k side">Extraversion: high · low</span>
    <div class="grid">
      {#each CELLS as [k, pos] (k)}
        <p class="cell {pos}" class:top={k === r.top}><span class="cap">{k}</span><b>{Math.round(r.probs[k] * 100)}%</b></p>
      {/each}
      <span class="pt" aria-hidden="true" style="left: {r.N.percentile}%; top: {100 - r.E.percentile}%"></span>
    </div>
  </div>
  <p class="rs-p center">Extraversion {r.E.percentile}<sup>th</sup> · Neuroticism {r.N.percentile}<sup>th</sup> percentile
    <span class="rs-muted">({r.source === "bigfive" ? "from your Big Five result" : "from this test's own questions"})</span></p>
  <p class="rs-p center">The percentages are the model's chance of each area, after your description ranking. They show how sure the model is, not how far inside an area you are.</p>
  {#if r.agreement}
    <p class="rs-p center">From your scores alone, the most likely area is <b class="cap">{r.traitTop}</b> ({pct(r.traitProbs[r.traitTop!])}).
      You ranked its description {ORD[r.agreement.rankOfTraitTop]}.
      {#if r.agreement.status === "agrees"}Your ranking agrees with your scores.
      {:else if r.agreement.status === "partly"}Your ranking partly agrees: you put <span class="cap">{r.agreement.firstChoice}</span> first.
      {:else}Your ranking conflicts with your scores: you put <span class="cap">{r.agreement.firstChoice}</span> first. The ranking counts only a little, so the result still follows your scores. Read both descriptions and judge which fits.{/if}</p>
  {:else if r.ranking}
    <p class="rs-p center">Your scores do not favour any one area, so the result comes from your description ranking.</p>
  {/if}
</section>
{#if r.nearLine && r.token.endsWith("[dom]")}<Note text="Your point is close to the middle of one of the two scales. The model is fairly sure which area you are in, but you are near its edge, not far inside it." />{/if}
{#each r.meta.quality as q (q.message)}<Note text={q.message} />{/each}
<style>
  .tq { justify-content: center; display: grid; grid-template-columns: 2rem minmax(0, 26rem); grid-template-rows: auto auto; gap: 6px; margin-bottom: 14px; }
  .ax { text-align: center; }
  .side { writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; }
  .grid { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
  .cell { margin: 0; padding: 18px 10px; display: grid; justify-items: center; gap: 2px; font-size: var(--fs-base); color: var(--c-muted); }
  .cell b { font: bold var(--fs-md) var(--font-mono); color: var(--c-ink); }
  .cell.top, .cell.top b { color: var(--c-brand); }
  .tl, .tr { border-bottom: 1px solid var(--c-line); }
  .tl, .bl { border-right: 1px solid var(--c-line); }
  .center { text-align: center; }
  .cap { text-transform: capitalize; }
  .pt { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: var(--c-brand); box-shadow: 0 0 0 3px var(--c-surface); transform: translate(-50%, -50%); }
</style>
