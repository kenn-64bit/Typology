<script lang="ts">
  import type { JungResult } from "@typo/engine-jung";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: JungResult; answered: number } = $props();
  const max = $derived(Math.max(...r.functions.map(f => f.percentile), 1));
</script>

<Header code={r.code} confidence={r.confidence} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each r.functions as f (f.f)}
    {@const key = f.f === r.dom || f.f === r.aux}
    <div class="rs-row fn">
      <p class="rs-name"><b class="rs-lt" class:rs-muted={!key}>{f.f}</b> {f.name}</p>
      <Scale p={(f.percentile / max) * 100} on={key} />
      <p class="rs-val rs-muted">{f.f === r.dom ? "(dominant)" : f.f === r.aux ? "(auxiliary)" : ""}</p>
    </div>
  {/each}
  <p class="rs-p mbti"><span class="rs-k">MBTI letters</span>
    {#each Object.values(r.letters) as l, i (i)}<b class="rs-lt">{l.letter}</b>{" "}{Math.round(l.p * 100)}%{i < 3 ? " · " : ""}{/each}</p>
  <p class="rs-sub">As MBTI that reads {r.mbti}, whose conventional stack is {r.mbtiStack[0]}–{r.mbtiStack[1]} (interpretation only).
    Your code above comes straight from your function scores, so it can differ.</p>
</section>
{#if r.usedBigFive}<Note text="Your Big Five Extraversion score was the starting point for the E/I scale." />{/if}
<style>
  .fn { padding: 5px 0; grid-template-columns: 15rem minmax(8rem, 1fr) 7rem; }
  .fn .rs-name { white-space: nowrap; }
  .fn .rs-lt { display: inline-block; min-width: 1.6rem; }
  .fn .rs-lt.rs-muted { color: var(--c-muted); }
  .mbti { margin-top: 18px; }
  .mbti .rs-k { margin-right: 10px; }
  .mbti .rs-lt { font-size: 13px; }
  @media (max-width: 760px) { .fn { grid-template-columns: minmax(0, 1fr) auto; } .fn .rs-name { white-space: normal; } .fn .rs-val:empty { display: none; } }
</style>
