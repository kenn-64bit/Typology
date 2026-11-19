<script lang="ts">
  import type { EnneaResult } from "@typo/engine-enneagram";
  let { r, answered }: { r: EnneaResult; answered: number } = $props();
  const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<h2 class="post-title">Your result</h2>
<p><span class="result-code">{r.stacking} {r.tritype} ({r.core}w{r.wing})</span></p>
<p class="meta">{answered} answers</p>
<dl class="res">
  <dt>Core type</dt>
  <dd>{r.core}: {r.coreName}, {pct(r.coreP)} · runner-up {r.runnerUp.type} ({pct(r.runnerUp.p)})</dd>
  <dt>Wing</dt>
  <dd>{r.core}w{r.wing}, {pct(r.wingP)}{#if r.balancedWing} · <strong>balanced</strong>: both neighbors fit about equally{/if}</dd>
  <dt>Instincts</dt>
  <dd>{r.stacking}, {pct(r.stackingP)}</dd>
  <dt>Tritype</dt>
  <dd>{r.tritype}, {pct(r.tritypeP)}</dd>
</dl>
