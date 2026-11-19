<script lang="ts">
  import type { JungResult } from "@typo/engine-jung";
  import Header from "./Header.svelte";
  let { r, answered }: { r: JungResult; answered: number } = $props();
  const max = $derived(Math.max(...r.functions.map(f => f.percentile), 1));
</script>

<Header code={r.code} confidence={r.confidence} {answered} />
<p><strong>MBTI letters:</strong>
  {#each Object.values(r.letters) as l, i (i)}{l.letter} {Math.round(l.p * 100)}%{i < 3 ? " · " : ""}{/each}</p>
<p class="meta">As MBTI that reads {r.mbti}, whose conventional stack is {r.mbtiStack[0]}–{r.mbtiStack[1]} (interpretation only).
  Your code above comes straight from your function scores, so it can differ.</p>
<dl class="res">
  {#each r.functions as f (f.f)}
    <dt>{f.f}: {f.name}{f.f === r.dom ? " (dominant)" : f.f === r.aux ? " (auxiliary)" : ""}</dt>
    <dd><span class="bar" aria-hidden="true"><span style="width: {(f.percentile / max) * 100}%"></span></span></dd>
  {/each}
</dl>
{#if r.usedBigFive}<p class="meta">Your Big Five Extraversion score was the starting point for the E/I scale.</p>{/if}
