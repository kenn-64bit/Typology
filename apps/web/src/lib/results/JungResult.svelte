<script lang="ts">
  import type { JungResult } from "@typo/engine-jung";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  import Scale from "./Scale.svelte";
  let { r, answered }: { r: JungResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const names = (cs: { f: string }[]) => cs.map(c => c.f).join(", ");
</script>

<Header code={r.code === "unresolved" ? "no clear main function" : r.code} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  {#each r.functions as f (f.f)}
    {@const key = f.f === r.dominant.f || f.f === r.auxiliary.f}
    <div class="rs-row fn">
      <p class="rs-name"><b class="rs-lt" class:rs-muted={!key}>{f.f}</b> {f.name}<small>{f.percentile}<sup>th</sup> model percentile</small></p>
      <Scale p={f.percentile} on={key} />
      <p class="rs-val rs-muted">{f.f === r.dominant.f ? "dominant" : f.f === r.auxiliary.f ? "auxiliary" : ""}<small>{pct(f.pTop)} chance highest</small></p>
    </div>
  {/each}
  {#if !r.dominant.f}
    <p class="rs-p">No function clearly scored highest, so no code is given. Most likely main functions: {names(r.dominant.candidates)}.</p>
  {:else if !r.auxiliary.f}
    <p class="rs-p">Main function {r.dominant.f} ({pct(r.dominant.p)} chance it is the highest of the eight). The helper is unclear: {names(r.auxiliary.candidates)} scored about the same, so it is shown as (?).</p>
  {:else}
    <p class="rs-p">Main function {r.dominant.f}: {pct(r.dominant.p)} chance it is the highest of the eight. Helper {r.auxiliary.f}: {pct(r.auxiliary.p)} chance it is the highest of the four on the other axis. These are two separate estimates, not a chance for the whole code.</p>
  {/if}
  <p class="rs-p mbti"><span class="rs-k">MBTI letters</span>
    {#each Object.values(r.letters) as l, i (i)}<b class="rs-lt">{l.letter}</b>{" "}{l.letter === "X" ? "no clear preference" : `${Math.round(l.p * 100)}%`}{i < 3 ? " · " : ""}{/each}</p>
  <p class="rs-sub">These letters come from separate questions about preferences{#if r.mbtiStack}. As MBTI they read {r.mbti}, whose conventional stack is {r.mbtiStack[0]}–{r.mbtiStack[1]} (interpretation only){/if}.
    Your code above comes from your function scores, so it can differ.</p>
</section>
{#each r.meta.quality as q (q.message)}<Note text={q.message} />{/each}
<Note text="Percentages are uncalibrated model estimates. Bars show each function's own score, not its size relative to your highest one." />
<Note text="This test is scored on its own answers. Your Big Five result is not used." />
<style>
  .fn { padding: 5px 0; grid-template-columns: 15rem minmax(8rem, 1fr) 7rem; }
  .fn .rs-name { white-space: nowrap; }
  .fn .rs-lt { display: inline-block; min-width: 1.6rem; }
  .fn .rs-lt.rs-muted { color: var(--c-muted); }
  .mbti { margin-top: 18px; }
  .mbti .rs-k { margin-right: 10px; }
  .mbti .rs-lt { font-size: var(--fs-md); }
  @media (max-width: 760px) { .fn { grid-template-columns: minmax(0, 1fr) auto; } .fn .rs-name { white-space: normal; } .fn .rs-val:empty { display: none; } }
</style>
