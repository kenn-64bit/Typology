<script lang="ts">
  import type { BigFiveResult } from "@typo/engine-bigfive";
  import { SLOAN_POSITIONS } from "../glossary.ts";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: BigFiveResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<Header code={r.sloan} confidence={r.confidence} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each Object.values(r.traits) as t, i (t.trait)}
    {@const pos = SLOAN_POSITIONS[i]!}
    {@const side = t.letter === pos.hi[0] ? "hi" : t.letter === pos.lo[0] ? "lo" : null}
    <div class="rs-row">
      <p class="rs-name">{t.name}<small>{t.percentile}<sup>th</sup> percentile</small></p>
      <Scale p={t.percentile} centered lo={pos.lo[0]} hi={pos.hi[0]} {side} />
      <p class="rs-val"><span class="rs-sr">Letter </span><b class="rs-lt">{t.letter}</b> {side === "hi" ? pos.hi[1] : pos.lo[1]}<small>{pct(Math.max(t.pHigh, 1 - t.pHigh))} sure</small></p>
    </div>
  {/each}
</section>
<Note text="Percentiles compare you with the test's built-in average, not with measured population norms." />
