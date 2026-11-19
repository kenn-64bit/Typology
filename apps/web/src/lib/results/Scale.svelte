<script lang="ts">
  /**
   * A 0–100 scale. `centered`: the middle (50) is marked and the fill runs from the middle to the value, so you can see
   * which side you fall on and how far. Otherwise the fill runs from 0. Decorative: the value is always printed next to it.
   */
  let { p, centered = false, lo = "", hi = "", side = null, on = false }:
    { p: number; centered?: boolean; lo?: string; hi?: string; side?: "lo" | "hi" | null; on?: boolean } = $props();
  const v = $derived(Math.max(0, Math.min(100, p)));
</script>

<span class="rs-scale" aria-hidden="true">
  <span class="rs-end" class:on={side === "lo"}>{lo}</span>
  <span class="rs-track" class:mid={centered}>
    {#if centered}
      <span class="rs-fill" style="left: {Math.min(v, 50)}%; width: {Math.abs(v - 50)}%"></span><span class="rs-dot" style="left: {v}%"></span>
    {:else}
      <span class="rs-fill" class:on style="width: {v}%"></span>
    {/if}
  </span>
  <span class="rs-end" class:on={side === "hi"}>{hi}</span>
</span>
