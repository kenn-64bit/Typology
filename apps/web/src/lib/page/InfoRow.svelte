<script lang="ts">
  /** Info row: short facts in capitals with · between them. */
  let { facts }: { facts: string[] } = $props();
</script>

<p class="info-row">  {#each facts as f, i (i)}{#if i}<span class="sep" aria-hidden="true">·</span>{/if}<span>{f}</span>{/each}
</p>

<style>
  .info-row { margin: 0 0 0.6rem; font: bold var(--fs-xs)/1.6 var(--font-head); letter-spacing: 0.02em; text-transform: lowercase; color: var(--meta); }
  .sep { color: var(--tan); margin: 0 0.4em; }
</style>
