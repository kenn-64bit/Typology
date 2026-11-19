<script lang="ts">
  // Glossary page: one section per system; each token is one chip row.
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import SectionHeading from "$lib/page/SectionHeading.svelte";
  import Masthead from "./Masthead.svelte";
  import { GLOSSARY_PAGES, tokenId } from "./glossaryContent.ts";
  import "./columns.css";
</script>

<Masthead title="Glossary" />

<div class="duo">
  {#each GLOSSARY_PAGES as p (p.id)}
    <section id={p.id} aria-labelledby="g-{p.id}">
      <div id="g-{p.id}"><SectionHeading text={p.system} /></div>
      {#each p.rows as [token, name, meaning] (token)}
        <div id={tokenId(p.id, token)} class="entry">
          <ChipRow label="{token}:"><strong>{name}</strong> · {meaning}</ChipRow>
        </div>
      {/each}
      <ArrowRow><a href={p.href}>Read the {p.system} page</a></ArrowRow>
    </section>
  {/each}
</div>

<style>
  .entry { scroll-margin-top: 1rem; }
  .entry:target :global(.chip) { background: var(--rust); }
</style>
