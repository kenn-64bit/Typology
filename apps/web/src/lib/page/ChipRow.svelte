<script lang="ts">
  import type { Snippet } from "svelte";
  /** Chip row: label (ends with a colon) in a filled chip, then its text. href makes the chip a glossary link. */
  let { label, href, children }: { label: string; href?: string; children?: Snippet } = $props();
</script>

<div class="chip-row">{#if href}<a class="chip" {href}>{label}</a>{:else}<span class="chip">{label}</span>{/if}{#if children}{@render children()}{/if}</div>

<style>
  .chip-row { margin: 0 0 0.45rem; }
  .chip {
    display: inline-block; margin-right: 0.4rem; font: bold var(--fs-xs)/1.5 var(--font-body); color: var(--white); background: var(--teal);
    padding: 0.05rem 0.45rem; white-space: nowrap;
  }
  .chip-row :global(code) { font-family: var(--font-body); }
  a.chip:hover { background: var(--teal-dark); text-decoration: none; }
</style>
