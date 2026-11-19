<script lang="ts">
  import type { Snippet } from "svelte";
  /** Text row: one point, step or note. */
  let { children }: { children: Snippet } = $props();
</script>

<div class="arrow-row"><div class="body">{@render children()}</div></div>

<style>
  .arrow-row { margin: 0 0 0.45rem; }
  .body { min-width: 0; }
  .body :global(p) { margin: 0 0 0.3rem; }
</style>
