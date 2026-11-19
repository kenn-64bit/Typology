<script lang="ts">
  import type { BigFiveResult } from "@typo/engine-bigfive";
  import { SLOAN_POSITIONS } from "../glossary.ts";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: BigFiveResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const STRENGTH = { strong: "strong", clear: "clear", borderline: "borderline", middle: "middle" } as const;
</script>

<!-- No single confidence number: an average of five per-trait certainties is not the chance the whole code is right. -->
<Header code={r.sloan} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each Object.values(r.traits) as t, i (t.trait)}
    {@const pos = SLOAN_POSITIONS[i]!}
    {@const side = t.lean === "high" ? "hi" : t.lean === "low" ? "lo" : null}
    <div class="rs-row">
      <p class="rs-name">{t.name}<small>{t.percentile}<sup>th</sup> model percentile</small></p>
      <Scale p={t.percentile} centered lo={pos.lo[0]} hi={pos.hi[0]} {side} />
      {#if side}
        <p class="rs-val"><span class="rs-sr">Letter </span><b class="rs-lt">{t.letter}</b> {side === "hi" ? pos.hi[1] : pos.lo[1]}, {STRENGTH[t.strength]}<small>{pct(side === "hi" ? t.pHigh : 1 - t.pHigh)} model chance of this side</small></p>
      {:else}
        <p class="rs-val"><span class="rs-sr">Letter </span><b class="rs-lt">X</b> no clear lean<small>{pct(t.pHigh)} model chance above the middle</small></p>
      {/if}
    </div>
  {/each}
</section>
{#each r.meta?.quality ?? [] as q (q.message)}<Note text={q.message} />{/each}
<Note text="Percentiles compare you with the test's built-in average, not with measured population norms." />
<Note text="Marks show how far your score is from the middle. The “model chance” is a separate, uncalibrated estimate of which side of the middle you are on." />
