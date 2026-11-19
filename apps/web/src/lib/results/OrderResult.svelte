<script lang="ts">
  // Attitudinal Psyche and Temporistics: an order of four, read like the info page's position list.
  import type { RankResult } from "@typo/rank-engine";
  import Header from "./Header.svelte";
  let { r, answered, names }: { r: RankResult; answered: number; names: Record<string, string> } = $props();
</script>

<Header code={r.order} confidence={r.p} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  <ol class="order">
    {#each [...r.order] as a, i (a)}
      <li><span class="n" aria-hidden="true">{i + 1}</span><b class="rs-lt">{a}</b><span>{names[a]}</span>
        <span class="rs-muted avg">(average place {r.positions[a]!.toFixed(1)})</span></li>
    {/each}
  </ol>
  <p class="rs-runner">Runner-up order: <code>{r.runnerUp.order}</code> ({Math.round(r.runnerUp.p * 100)}%)</p>
</section>
<style>
  .order { list-style: none; margin: 0; padding: 0; display: grid; }
  .order li { display: grid; grid-template-columns: 1.5rem 2rem minmax(0, 1fr) auto; gap: 12px; align-items: baseline; padding: 8px 0; font-size: 13px; }
  .n { font: 11px var(--font-head); color: var(--c-muted); }
  .order .rs-lt { font-size: 20px; }
  .avg { font-size: 11.5px; }
</style>
