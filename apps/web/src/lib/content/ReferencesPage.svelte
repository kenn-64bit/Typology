<script lang="ts">
  // References: every citation on the site, in one place. Same masthead and serif columns as the glossary.
  import Divider from "$lib/page/Divider.svelte";
  import SectionHeading from "$lib/page/SectionHeading.svelte";
  import Masthead from "./Masthead.svelte";
  import { REFERENCES } from "./references.ts";
  import { EVIDENCE } from "./evidence.ts";
  import "./columns.css";
</script>

<svelte:head><title>References · Typology</title></svelte:head>

<Masthead title="References" />

<section class="ev">
  <div class="duo">
    {#each EVIDENCE as a (a.href)}
      <section id="ev-{a.href.slice(1)}">
        <h3 class="sub"><a href={a.href}>{a.sys}</a></h3>
        <p>{a.ev}</p>
      </section>
    {/each}
  </div>
</section>

<Divider />

<div class="duo">
  {#each REFERENCES as g (g.id)}
    <section id={g.id}>
      <SectionHeading text={g.title} />
      <ol class="refs">
        {#each g.refs as r (r.link)}
          <li>{r.text}{#if r.title} <em>{r.title}</em>{/if}{#if r.rest} {r.rest}{/if}
            <a href={r.link} rel="noopener" target="_blank">{r.label}</a></li>
        {/each}
      </ol>
    </section>
  {/each}
</div>

<Divider />
<p class="note">Each link opens the source or a public summary of the source. Some publisher sites and practitioner sites sell the tests that they describe.</p>

<style>
  .refs { list-style: none; margin: 0; padding: 0; }
  .refs li { margin: 0 0 0.55rem; padding-left: 1.2rem; text-indent: -1.2rem; overflow-wrap: anywhere; }
  .refs a { white-space: nowrap; }
  .ev section { scroll-margin-top: 1rem; }
  .ev p { margin: 0; }
  .ev .sub a { color: inherit; }
  .note { font-size: 12px; color: var(--meta); margin: 0; }
</style>
