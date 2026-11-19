<script lang="ts">
  import type { BigFiveResult } from "@typo/engine-bigfive";
  import { SLOAN_POSITIONS } from "../glossary.ts";
  import Header from "./Header.svelte";
  let { r, answered }: { r: BigFiveResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<Header code={r.sloan} confidence={r.confidence} {answered} level="strong" />
<dl class="res">
  {#each Object.values(r.traits) as t, i (t.trait)}
    {@const pos = SLOAN_POSITIONS[i]!}
    <dt>{t.name}: {t.percentile}<sup>th</sup> percentile</dt>
    <dd><span class="bar" aria-hidden="true"><span style="width: {t.percentile}%"></span></span>
      Letter <strong>{t.letter}</strong> ({t.letter === pos.hi[0] ? pos.hi[1] : pos.lo[1]}), {pct(Math.max(t.pHigh, 1 - t.pHigh))} sure</dd>
  {/each}
</dl>
<p class="meta">Percentiles compare you with the model's built-in average, not real population norms.</p>
