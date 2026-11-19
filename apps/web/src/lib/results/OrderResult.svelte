<script lang="ts">
  // Attitudinal Psyche and Temporistics: an order of four, published only when the rankings support it.
  import type { RankResult } from "@typo/rank-engine";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  let { r, answered, names, caveat }: { r: RankResult; answered: number; names: Record<string, string>; caveat?: string } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const aspects = $derived(Object.keys(names));
  const byPlace = $derived([...aspects].sort((a, b) => r.positions[a]! - r.positions[b]!));
  const hero = $derived(r.resolved ?? (r.first ? `${r.first.aspect}???` : "no clear order"));
</script>

<Header code={hero} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#if r.resolved}
    <p class="rs-p">This order has a {pct(r.p)} model chance. The model is uncalibrated.</p>
  {:else if r.first}
    <p class="rs-p"><b>{names[r.first.aspect]}</b> comes first in most of your rankings ({pct(r.first.p)} model chance). The order of the other three is unclear.</p>
  {:else}
    <p class="rs-p">Your rankings do not point to one order. The most likely orders are {r.candidates.map(c => `${c.order} (${pct(c.p)})`).join(", ") || r.order}.</p>
  {/if}
  <ol class="order">
    {#each byPlace as a (a)}
      <li><b class="rs-lt">{a}</b><span>{names[a]}</span>
        <span class="rs-muted avg">average place {r.positions[a]!.toFixed(1)} · {pct(r.marginals[a]![0]!)} first · {pct(r.marginals[a]![aspects.length - 1]!)} last</span></li>
    {/each}
  </ol>
  {#if r.resolved}<p class="rs-runner">Runner-up order: <code>{r.runnerUp.order}</code> ({pct(r.runnerUp.p)})</p>{/if}
</section>
{#each r.meta.quality as q (q.message)}<Note text={q.message} />{/each}
{#if caveat}<Note text={caveat} />{/if}
<style>
  .order { list-style: none; margin: 0; padding: 0; display: grid; }
  .order li { display: grid; grid-template-columns: 2rem minmax(0, 1fr) auto; gap: 12px; align-items: baseline; padding: 8px 0; font-size: 13px; }
  .order .rs-lt { font-size: 20px; }
  .avg { font-size: 11.5px; }
  @media (max-width: 760px) { .order li { grid-template-columns: 2rem minmax(0, 1fr); } .avg { grid-column: 2; } }
</style>
