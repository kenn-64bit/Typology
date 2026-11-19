<script lang="ts">
  import type { EnneaResult } from "@typo/engine-enneagram";
  import Header from "./Header.svelte";
  let { r, answered }: { r: EnneaResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<Header code="{r.stacking} {r.tritype} ({r.core}w{r.wing})" {answered} />
<section class="rs-sec" aria-labelledby="rs-bd">
  <h3 class="rs-k" id="rs-bd">breakdown</h3>
  <dl class="rs-dl">
    <dt class="rs-k">Core type</dt><dd><code>{r.core}</code></dd>
    <dd>{r.coreName}, {pct(r.coreP)} <span class="rs-muted">· runner-up {r.runnerUp.type} ({pct(r.runnerUp.p)})</span></dd>
    <dt class="rs-k">Wing</dt><dd><code>{r.core}w{r.wing}</code></dd>
    <dd>{pct(r.wingP)}{#if r.balancedWing}{" · "}<strong>balanced</strong>: both neighbors fit about equally{/if}</dd>
    <dt class="rs-k">Tritype</dt><dd><code>{r.tritype}</code></dd><dd>{pct(r.tritypeP)}</dd>
    <dt class="rs-k">Instincts</dt><dd><code>{r.stacking}</code></dd><dd>{pct(r.stackingP)}</dd>
  </dl>
</section>
