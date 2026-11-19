<script lang="ts">
  import type { Snippet } from "svelte";
  import { exampleFor } from "./examples.ts";
  import QuizModal from "./QuizModal.svelte";
  import type { Typology } from "./typologies.ts";

  /** Page block for a test: start card + notation. The quiz itself runs in a full-screen modal. */
  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  let open = $state(false);
</script>

<div class="inner">
  <div id="test">
    <article class="post boxed">
      <h2 class="post-title">Take the test</h2>
      <p class="meta">{t.questions} · all on one page</p>
      <p>The quiz opens above this page with every question at once. Answer for how you usually are, not how you'd like to be.
        Answers are not saved until you reach your result.</p>
      <button class="read-more as-btn" onclick={() => (open = true)}>start</button>
    </article>
  </div>

  <div>
    <section class="mini">
      <h3 class="mini-head">Notation</h3>
      <p class="meta">Random example: <code>{exampleFor(t.slug)}</code></p>
      <ul>{#each t.notation as n (n)}<li>{n}</li>{/each}</ul>
    </section>
    <section class="mini">
      <h3 class="mini-head">Evidence</h3>
      <p>{t.caveat}</p>
    </section>
  </div>
</div>

{#if open}
  <QuizModal {t} {result} onclose={() => (open = false)} />
{/if}

<style>
  .as-btn { border: 0; cursor: pointer; text-align: left; font-family: var(--font-body); }
</style>
