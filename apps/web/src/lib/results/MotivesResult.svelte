<script lang="ts">
  import type { MotivesResult } from "@typo/engine-motives";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: MotivesResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const tied = $derived(r.dominant.trait === null && r.dominant.candidates.length > 1);
</script>

<Header code={r.code} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each Object.entries(r.traits) as [k, t] (k)}
    <div class="rs-row">
      <p class="rs-name">{t.name}<small>{t.percentile}<sup>th</sup> model percentile</small></p>
      <Scale p={t.percentile} centered side={t.lean === "high" ? "hi" : t.lean === "low" ? "lo" : null} />
      {#if t.lean}
        <p class="rs-val">Leaning <b class="rs-lt">{t.letter}</b>{#if r.dominant.trait === k}, strongest{/if}<small>{pct(t.lean === "high" ? t.pHigh : 1 - t.pHigh)} model chance of this side</small></p>
      {:else}
        <p class="rs-val"><b class="rs-lt">X</b> no clear lean<small>{pct(t.pHigh)} model chance above the middle</small></p>
      {/if}
    </div>
  {/each}
</section>
{#if tied}<Note text="No single strongest trait: {r.dominant.candidates.map(c => r.traits[c].name).join(', ')} are about equally far from the middle, so no letter has bars." />{/if}
{#each r.meta.quality as q (q.message)}<Note text={q.message} />{/each}
<Note text="Letters and bars show how far each score is from the middle. The “model chance” is a separate, uncalibrated estimate of which side you are on." />
<Note text="This test is scored on its own answers. Your Big Five result is not used." />
