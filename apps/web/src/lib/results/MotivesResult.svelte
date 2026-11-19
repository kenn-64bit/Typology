<script lang="ts">
  import type { MotivesResult } from "@typo/engine-motives";
  import Header from "./Header.svelte";
  let { r, answered }: { r: MotivesResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<Header code={r.code} confidence={r.confidence} {answered} level="exploratory" />
<dl class="res">
  {#each Object.entries(r.traits) as [k, t] (k)}
    <dt>{t.name}: {t.percentile}<sup>th</sup> percentile</dt>
    <dd><span class="bar" aria-hidden="true"><span style="width: {t.percentile}%"></span></span>
      Leaning <strong>{t.letter}</strong>, {pct(Math.max(t.pHigh, 1 - t.pHigh))} sure</dd>
  {/each}
</dl>
{#if r.usedBigFive}<p class="meta">Your Big Five result gave this test a head start.</p>{/if}
