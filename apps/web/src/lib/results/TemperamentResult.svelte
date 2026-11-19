<script lang="ts">
  import type { TemperamentResult } from "@typo/engine-temperament";
  import Header from "./Header.svelte";
  let { r, answered }: { r: TemperamentResult; answered: number } = $props();
</script>

<Header code={r.token} confidence={r.pTop} {answered} level="exploratory" />
<dl class="res">
  {#each Object.entries(r.probs).sort((a, b) => b[1] - a[1]) as [k, p] (k)}
    <dt class="cap">{k}: {Math.round(p * 100)}%</dt>
    <dd><span class="bar" aria-hidden="true"><span style="width: {p * 100}%"></span></span></dd>
  {/each}
</dl>
<p>Extraversion {r.E.percentile}<sup>th</sup> · Neuroticism {r.N.percentile}<sup>th</sup> percentile
  <span class="meta">({r.source === "bigfive" ? "from your Big Five result" : "from this test's own questions"})</span></p>
<style>.cap { text-transform: capitalize; }</style>
