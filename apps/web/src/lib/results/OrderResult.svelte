<script lang="ts">
  import type { RankResult } from "@typo/rank-engine";
  import Header from "./Header.svelte";
  let { r, answered, names }: { r: RankResult; answered: number; names: Record<string, string> } = $props();
</script>

<Header code={r.order} confidence={r.p} {answered} level="exploratory" />
<ol class="order">
  {#each [...r.order] as a, i (a)}<li><strong>{a}</strong> · {names[a]} <span class="meta">(average place {r.positions[a]!.toFixed(1)})</span></li>{/each}
</ol>
<p class="meta">Runner-up order: <code>{r.runnerUp.order}</code> ({Math.round(r.runnerUp.p * 100)}%)</p>
<style>.order { padding-left: 1.4rem; } .order li { margin: 0.2rem 0; }</style>
