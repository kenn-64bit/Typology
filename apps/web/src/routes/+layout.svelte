<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { app } from "$lib/app.svelte.ts";
  import { TYPOLOGIES } from "$lib/typologies.ts";
  import { GLOSSARY } from "$lib/glossary.ts";
  let { children } = $props();
  onMount(() => { app.load(); });

  const nav = [
    { href: "/", label: "Overview" },
    ...TYPOLOGIES.map(t => ({ href: `/${t.slug}`, label: t.navName })),
    { href: "/references", label: "References" },
  ];
  const isCurrent = (href: string) => (href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href));

  let menuOpen = $state(false);
  // close the mobile menu after navigating
  $effect(() => { page.url.pathname; menuOpen = false; });

  let filter = $state("");
  const matches = $derived.by(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return [];
    return GLOSSARY.flatMap(sec => sec.groups.flatMap(g => g.rows
      .filter(([k, v]) => k.toLowerCase() === q || v.toLowerCase().includes(q))
      .map(([k, v]) => ({ id: sec.id, k, v, sys: sec.title })))).slice(0, 12);
  });

  function deleteData() {
    if (confirm("Delete all saved results from this browser?")) app.clearAll();
  }
</script>

<svelte:head><title>Typology</title></svelte:head>
<svelte:window onkeydown={e => { if (e.key === "Escape") menuOpen = false; }} />

{#snippet search(id: string)}
  <div class="search">
    <label class="sr-only" for={id}>Search the glossary</label>
    <input {id} type="search" bind:value={filter} />
    <svg class="search-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.5 1a5.5 5.5 0 0 1 4.4 8.8l3.9 3.9-1.1 1.1-3.9-3.9A5.5 5.5 0 1 1 6.5 1zm0 1.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8z" fill="currentColor" /></svg>
  </div>
  {#if matches.length}
    <ul class="kw-results" aria-label="Glossary matches">
      {#each matches as m (m.id + m.k)}<li><a href="/glossary#{m.id}"><code>{m.k}</code> {m.v}</a> <small>({m.sys})</small></li>{/each}
    </ul>
  {/if}
{/snippet}

{#snippet keywords()}
  <h2 class="kw-head">Keywords</h2>
  <ul class="kw">
    <li><a href="/">Overview</a></li>
    <li>Typologies
      <ul>{#each TYPOLOGIES as t (t.slug)}<li><a href="/{t.slug}">{t.navName}</a></li>{/each}</ul>
    </li>
    <li><a href="/glossary">Glossary</a>
      <ul>{#each GLOSSARY as g (g.id)}<li><a href="/glossary#{g.id}">{g.title}</a></li>{/each}</ul>
    </li>
    <li><a href="/references">References</a></li>
  </ul>
{/snippet}

<div class="frame">
  <header class="top">
    <a class="logo" href="/">Typology</a>
    <button class="burger" aria-expanded={menuOpen} aria-controls="mobile-menu" onclick={() => (menuOpen = !menuOpen)}>
      <span class="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
      <span class="bars" class:open={menuOpen} aria-hidden="true"><span></span><span></span><span></span></span>
    </button>
    <nav class="main-nav" aria-label="Main">
      <ul>
        {#each nav as n (n.href)}
          <li><a href={n.href} class:current={isCurrent(n.href)} aria-current={isCurrent(n.href) ? "page" : undefined}>{n.label}</a></li>
        {/each}
      </ul>
    </nav>
  </header>

  <!-- Mobile menu: main links + the sidebar's search and keywords -->
  <div id="mobile-menu" class="mobile-menu" class:open={menuOpen}>
    <nav aria-label="Main (mobile)">
      <ul class="m-nav">
        {#each nav as n (n.href)}
          <li><a href={n.href} class:current={isCurrent(n.href)} aria-current={isCurrent(n.href) ? "page" : undefined}>{n.label}</a></li>
        {/each}
      </ul>
    </nav>
    <div class="m-side">
      {@render search("kw-m")}
      {@render keywords()}
    </div>
  </div>

  <div class="body">
    <div class="band" aria-hidden="true"></div>

    <div class="panel">
      <main class="content">
        {#if app.storageError}<p class="warn" role="alert">{app.storageError}</p>{/if}
        {#if app.loaded}{@render children()}{:else}<p>Loading…</p>{/if}
      </main>
    </div>

    <aside class="side">
      {@render search("kw")}
      {@render keywords()}
    </aside>
    <div class="edge" aria-hidden="true"></div>
  </div>

  <footer class="foot">
    <div class="foot-text">
      <nav aria-label="Footer" class="foot-links"><a href="/">Overview</a> | <a href="/bigfive">Big Five</a> | <a href="/glossary">Glossary</a> | <a href="/references">References</a></nav>
      <div class="help">
        <p><strong>Feeling depressed or thinking of harming yourself?</strong> You're not alone.</p>
        <p class="foot-row"><span>Philippines: NCMH Crisis Hotline <a href="tel:1553">1553</a> · <a href="tel:+639178998727">0917 899 8727</a></span>
          <span>Elsewhere: <a href="https://findahelpline.com" rel="noopener" target="_blank">findahelpline.com</a></span>
          <span>Emergency: call your local emergency number</span></p>
      </div>
      <p class="foot-row"><span>Results describe preferences, not abilities or mental health; not for diagnosis or hiring.</span>
        <span>Private mode: data stays in this browser</span>
        <button class="foot-btn" onclick={deleteData}>Delete my data</button></p>
    </div>
    <p class="foot-mark" aria-hidden="true">Typology</p>
  </footer>
</div>

<style>
  .frame { --band: clamp(150px, 20vw, 262px); --side: clamp(170px, 15vw, 230px); min-height: 100vh; display: flex; flex-direction: column; }

  /* ---------- header ---------- */
  .top {
    display: grid; grid-template-columns: var(--band) minmax(0, 1fr); align-items: end; min-height: 75px;
  }
  .logo { font: 2.6rem/1 var(--font-logo); color: var(--cream); padding: 0 0 0.6rem 1.5rem; text-shadow: 1px 1px 0 rgb(0 0 0 / 0.3); }
  .logo:hover { text-decoration: none; }
  .main-nav ul { display: flex; flex-wrap: wrap; list-style: none; margin: 0 1rem 0 0; padding: 0; max-width: calc(100% - var(--side) - 10px); margin-left: auto; }
  .main-nav li { flex: 1 0 auto; text-align: center; border-right: 1px solid rgb(255 255 255 / 0.25); }
  .main-nav li:last-child { border-right: 0; }
  .main-nav ul::before { content: ""; flex: 1000 0 0; } /* spacer pushes the links to the right */
  .main-nav a {
    display: block; padding: 1.4rem clamp(0.35rem, 0.9vw, 0.9rem) 0.75rem; color: var(--white);
    font: clamp(12px, 0.95vw, 14px) var(--font-head); text-shadow: 1px 1px 0 rgb(0 0 0 / 0.25);
  }
  .main-nav a.current { text-decoration: underline; text-underline-offset: 5px; }
  .burger { display: none; }
  .mobile-menu { display: none; }

  /* ---------- body ---------- */
  .body { flex: 1; display: grid; grid-template-columns: var(--band) minmax(0, 1fr) var(--side) 10px; align-items: stretch; }
  .band { background: transparent; }
  .panel {
    position: relative; z-index: 2; background: var(--cream);
    border: 1px solid #f6dcc6; border-top: 0;
    /* thin inner rule + drop shadow onto the sidebar, as in the reference */
    box-shadow: inset 0 0 0 3px var(--cream), inset 0 0 0 4px #e9cbb3, 4px 0 7px -1px rgb(60 30 15 / 0.35), -1px 0 0 rgb(255 255 255 / 0.35);
    display: flex; flex-direction: column;
  }
  .content { padding: 0.6rem 1.3rem 1rem; flex: 1; }

  /* ---------- right sidebar ---------- */
  .side {
    position: relative; padding-top: 1.6rem; font-size: 10.5px;
    background: linear-gradient(90deg, #8eb8c7 0, #a3c8d4 14px, var(--sky) 40px, var(--sky) calc(100% - 18px), #9cc2cf 100%);
  }
  .search {
    /* bare input straddling the panel edge, like the reference: no surrounding box */
    position: relative; z-index: 3; display: flex; align-items: center; gap: 0.4rem;
    margin: 0 0.5rem 1.4rem -7.5rem;
  }
  .search input {
    flex: 1; min-width: 0; height: 1.45rem; padding: 0.15rem 0.35rem;
    background: #fdf1e6; border: 1px solid #b9aa9c;
    box-shadow: inset 1px 1px 1px rgb(90 60 40 / 0.2), 0 1px 0 rgb(255 255 255 / 0.5);
  }
  .search-icon { flex: none; color: #1f5d74; }
  .kw-results { list-style: none; margin: 0 0.5rem 0.8rem; padding: 0.3rem 0.5rem; background: var(--cream); box-shadow: 1px 2px 4px rgb(40 70 90 / 0.25); }
  .kw-head {
    font: bold 13px var(--font-head); color: var(--white); letter-spacing: 0.04em;
    text-shadow: 1px 1px 1px rgb(30 70 90 / 0.7);
    background: linear-gradient(#9ec7d4, #7fb2c3 45%, #5f97ab);
    box-shadow: 0 3px 5px -1px rgb(30 70 90 / 0.35);
    padding: 0.5rem 0.75rem; margin: 0 0 0.9rem;
  }
  .kw, .kw ul { list-style: none; margin: 0; padding: 0 0 0 0.85rem; }
  .kw ul { padding-left: 0.9rem; }
  .kw li { color: #1f5d74; line-height: 1.7; }
  .kw a { color: #1f5d74; }
  .edge { background: linear-gradient(90deg, #c9c1ba, var(--edge) 4px); }
  .warn { background: var(--cream-dark); padding: 0.4rem; }
  :global(.sr-only) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  /* ---------- footer ---------- */
  .foot {
    display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
    background: var(--header-dark); border-top: 3px solid var(--tan); color: var(--cream);
    padding: 0.8rem 1.5rem 0.9rem max(16px, calc(var(--band) + 1.3rem)); font: 11px/1.6 Verdana, Arial, sans-serif;
  }
  .foot p { margin: 0.15rem 0; }
  .foot a, .foot-btn { color: var(--cream); text-decoration: underline; }
  .foot a, .foot-btn { transition: color var(--dur-fast) var(--ease-out); }
  .foot a:hover, .foot-btn:hover { color: var(--sky); }
  .help a:hover { color: var(--cream); }
  .foot-btn { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  .help, .help a { color: var(--sky); }
  .help { margin: 0.3rem 0 0.5rem; padding: 0.4rem 0.7rem; background: rgb(0 0 0 / 0.18); border-left: 3px solid var(--sky); }
  .foot-row { display: flex; flex-wrap: wrap; gap: 0 1.4rem; }
  .foot-text { flex: 1 1 24rem; min-width: 0; }
  .foot-mark { flex: none; font: 1.8rem/1 var(--font-logo); color: var(--cream); opacity: 0.9; }

  /* ---------- responsive ---------- */
  @media (max-width: 1600px) and (min-width: 1001px) {
    .top { grid-template-columns: minmax(0, 1fr); }
    .logo { padding: 0.7rem 0 0 1.5rem; }
    .main-nav ul { padding-left: 1rem; }
    .main-nav a { padding-top: 0.7rem; }
  }
  @media (max-width: 1000px) {
    .body { grid-template-columns: minmax(0, 1fr) var(--side); }
    .band, .edge { display: none; }
    .search { margin-left: -4rem; }
    .top { grid-template-columns: minmax(0, 1fr); background: none; }
    .main-nav ul { max-width: none; padding-left: 1rem; }
    .logo { padding-top: 0.8rem; }
    .foot { padding-left: 1.3rem; }
  }
  @media (max-width: 760px) {
    /* burger replaces the nav; the sidebar moves into the menu */
    .top { grid-template-columns: minmax(0, 1fr) auto; align-items: center; min-height: 64px; }
    .logo { font-size: 2.1rem; padding: 0.5rem 0 0.5rem 16px; }
    .main-nav, .side { display: none; }
    .body { grid-template-columns: minmax(0, 1fr); }
    .content { padding-left: 16px; padding-right: 16px; }
    .burger {
      display: grid; place-items: center; width: 44px; height: 44px; margin-right: 10px;
      background: rgb(0 0 0 / 0.15); border: 1px solid rgb(255 255 255 / 0.3); cursor: pointer;
    }
    .bars { display: grid; gap: 5px; width: 22px; }
    .bars span { display: block; height: 2px; background: var(--cream); transition: transform var(--dur) var(--ease-out), opacity var(--dur) var(--ease-out); }
    .bars.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .bars.open span:nth-child(2) { opacity: 0; }
    .bars.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-menu.open { display: block; border-top: 1px solid rgb(255 255 255 / 0.2); animation: menu-in var(--dur) var(--ease-out); }
    @keyframes menu-in { from { opacity: 0; transform: translateY(-6px); } }
    .m-nav { list-style: none; margin: 0; padding: 0; }
    .m-nav a {
      display: block; padding: 0.7rem 16px; color: var(--white); font: 15px var(--font-head);
      border-bottom: 1px solid rgb(255 255 255 / 0.15); text-shadow: 1px 1px 0 rgb(0 0 0 / 0.25);
    }
    .m-nav a.current { background: rgb(0 0 0 / 0.18); text-decoration: underline; text-underline-offset: 4px; }
    .m-side { background: var(--sky); padding: 1rem 0 1rem; font-size: 13px; box-shadow: inset 0 4px 6px -2px rgb(40 20 10 / 0.35); }
    .m-side .search { margin: 0 16px 1rem; }
    .m-side .kw-head { font-size: 14px; }
    .foot { flex-direction: column; align-items: flex-start; gap: 0.6rem; padding: 1rem 16px 1.2rem; font-size: 12.5px; line-height: 1.7; }
    .foot-text { flex: none; width: 100%; }
    .foot p, .foot-links { margin: 0 0 0.6rem; }
    .help { padding: 0.6rem 0.7rem; }
    .foot-row { flex-direction: column; }
    .foot-btn { margin-top: 0.3rem; }
    .foot-mark { order: -1; font-size: 1.6rem; }
  }
</style>
