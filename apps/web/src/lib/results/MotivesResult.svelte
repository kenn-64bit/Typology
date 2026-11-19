<script lang="ts">
  import type { MotivesResult } from "@typo/engine-motives";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: MotivesResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<Header code={r.code} confidence={r.confidence} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each Object.entries(r.traits) as [k, t] (k)}
    <div class="rs-row">
      <p class="rs-name">{t.name}<small>{t.percentile}<sup>th</sup> percentile</small></p>
      <Scale p={t.percentile} centered side={t.pHigh >= 0.5 ? "hi" : "lo"} />
      <p class="rs-val">Leaning <b class="rs-lt">{t.letter}</b><small>{pct(Math.max(t.pHigh, 1 - t.pHigh))} sure</small></p>
    </div>
  {/each}
</section>
{#if r.usedBigFive}<Note text="Your Big Five scores were the starting point for this test." />{/if}
