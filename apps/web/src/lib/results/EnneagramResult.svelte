<script lang="ts">
  import type { EnneaResult } from "@typo/engine-enneagram";
  import Header from "./Header.svelte";
  import Note from "./Note.svelte";
  let { r, answered }: { r: EnneaResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const stack = $derived(r.stacking ?? (r.stackingFirst ? `${r.stackingFirst}/?/?` : "?/?/?"));
  const hero = $derived(r.core === null ? "no clear core type" : `${stack} ${r.tritype} (${r.core}w${r.wing ?? "?"})`);
</script>

<Header code={hero} {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  <dl class="rs-dl">
    <dt class="rs-k">Core type</dt><dd><code>{r.core ?? "?"}</code></dd>
    {#if r.core !== null}
      <dd>{r.coreName}, {pct(r.coreP)} from the statements <span class="rs-muted">· runner-up {r.runnerUp.type} ({pct(r.runnerUp.p)})</span></dd>
    {:else}
      <dd>The statements do not favour one type. Most likely: {r.coreCandidates.slice(0, 4).map(c => `${c.type} (${pct(c.p)})`).join(", ")}</dd>
    {/if}
    {#if r.selfPick}
      <dt class="rs-k">Your pick</dt><dd><code>{r.selfPick.type}</code></dd>
      <dd>The description you chose.
        {#if r.selfPick.agrees === true}It matches your statement result.
        {:else if r.selfPick.agrees === false}It differs from your statement result ({pct(r.selfPick.statementP)} for type {r.selfPick.type} from the statements). Read both descriptions.
        {:else}It is not counted as evidence for the core type.{/if}</dd>
    {/if}
    {#if r.core !== null}
      <dt class="rs-k">Wing</dt><dd><code>{r.core}w{r.wing ?? "?"}</code></dd>
      <dd>{#if r.wing === null}<strong>unresolved</strong>: both neighbours got similar support{:else}{pct(r.wingP)} of the support between the two neighbours{/if}</dd>
      <dt class="rs-k">Tritype</dt><dd><code>{r.tritype}</code></dd>
      <dd>{#each r.tritypeCenters as c, i (c.center)}{i ? " · " : ""}{c.center}: {c.type ?? `unclear (${c.candidates.map(x => x.type).join("/")})`}{/each}{#if !r.tritypeOrderResolved && r.tritypeCenters.every(c => c.type)}{" · "}order of the last two unclear{/if}</dd>
    {/if}
    <dt class="rs-k">Instincts</dt><dd><code>{stack}</code></dd>
    <dd>{#if r.stacking}{pct(r.stackingP)} model chance of this order{:else if r.stackingFirst}{r.stackingFirst} first; the rest is unclear{:else}unclear: {r.stackingCandidates.map(c => `${c.order} (${pct(c.p)})`).join(", ")}{/if}</dd>
  </dl>
</section>
{#each r.meta.quality as q (q.message)}<Note text={q.message} />{/each}
<Note text="The core type comes only from the statements. The description you picked is shown separately." />
<Note text="Wing and tritype are read from how much the statements support other types. They are rough guides, not measured traits, and the tritype has no probability." />
