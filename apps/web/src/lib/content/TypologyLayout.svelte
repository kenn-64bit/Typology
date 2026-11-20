<script lang="ts">
  import type { Snippet } from "svelte";
  import Divider from "$lib/page/Divider.svelte";
  import InfoRow from "$lib/page/InfoRow.svelte";
  import SectionHeading from "$lib/page/SectionHeading.svelte";
  import Masthead from "./Masthead.svelte";
  import QuizModal from "$lib/QuizModal.svelte";
  import type { Typology } from "$lib/typologies.ts";
  import "./columns.css";
  import { TEST_BOX } from "./shared.ts";

  /**
   * Typology page layout: banner, masthead, then two fixed text columns (a grid, so no text sits beside a heading).
   * Rows: Overview + test link | Notation; figure (full width); Each part | How to read + Mix-ups.
   * The test instructions show inside the quiz window, not on the page.
   */
  let { t, result, title, facts, format, extra, overview, notation, figure, parts, read, mixups }: {
    t: Typology; result: Snippet<[unknown, number]>; title: string; facts: string[];
    format: string; extra?: string; overview: Snippet;
    notation: Snippet; figure: Snippet; parts: Snippet; read: Snippet; mixups: Snippet;
  } = $props();
  let open = $state(false);
  const instructions = $derived([...TEST_BOX.instructions, ...(extra ? [extra] : [])]);
</script>

<Masthead {title} />

<div class="duo">
  <section class="overview">
    <SectionHeading text="Overview" />
    <InfoRow {facts} />
    {@render overview()}
    <button class="btn take" onclick={() => (open = true)}>{title} Test</button>
    <p class="format">{format}</p>
  </section>
  <section>
    <SectionHeading text="Notation" />
    {@render notation()}
  </section>
</div>

<Divider />
<figure class="fig">
  <SectionHeading text="What it measures" />
  {@render figure()}
</figure>
<Divider />

<div class="duo">
  <section>
    <SectionHeading text="What each letter means" />
    {@render parts()}
  </section>
  <div>
    <section>
      <SectionHeading text="How to read your result" />
      {@render read()}
    </section>
    <Divider />
    <section>
      <SectionHeading text="Common mix-ups" />
      {@render mixups()}
    </section>
  </div>
</div>

{#if open}<QuizModal {t} {result} {instructions} onclose={() => (open = false)} />{/if}

<style>
  .fig { margin: 0; padding: 0.4rem 0 0.8rem; }
  .overview :global(p) { margin: 0 0 0.6rem; }
  .take { display: block; width: 100%; margin-top: 0.4rem; color: var(--c-ink); background: var(--sky); border-color: var(--sky-dark); }
  .take:hover { background: var(--sky-dark); border-color: var(--sky-dark); }
  .overview .format { margin: 0.35rem 0 0; text-align: center; font-size: var(--fs-sm, 0.875rem); }
</style>
