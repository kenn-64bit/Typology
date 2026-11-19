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
  let folderDlg: HTMLDialogElement | undefined = $state();
  // Folder dialog: "idle" → click → "rising" (one file leaves the folder) → "open" (the file opens as an editor window).
  let filePhase = $state<"idle" | "rising" | "open">("idle");
  function openFile() {
    if (filePhase !== "idle") return;
    filePhase = "rising";
    setTimeout(() => { if (filePhase === "rising") filePhase = "open"; }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520);
  }
  // Editor content: one array per line, each segment is [css class, text].
  const CODE: [string, string][][] = [
    [["cm", "// Thank you for the nerd that inspired me to make this web application."]],
    [["cm", "// i sincerely fully appreciate you"]],
    [["cm", "// Tho im the nerd in charge of this project."]],
    [["cm", "// i should give credits also to you."]],
    [["cm", "// - sx4"]],
  ];
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
    <li><a class="kw-top" href="/">Overview</a></li>
    <li><span class="kw-top">Typologies</span>
      <ul>{#each TYPOLOGIES as t (t.slug)}<li><a href="/{t.slug}">{t.navName}</a></li>{/each}</ul>
    </li>
    <li><a class="kw-top" href="/glossary">Glossary</a>
      <ul>{#each GLOSSARY as g (g.id)}<li><a href="/glossary#{g.id}">{g.title}</a></li>{/each}</ul>
    </li>
    <li><a class="kw-top" href="/references">References</a></li>
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
    <div class="foot-grid">
      <nav aria-label="Footer">
        <ul class="row links">
          <li><a href="/">Overview</a></li><li><a href="/bigfive">Big Five</a></li><li><a href="/glossary">Glossary</a></li><li><a href="/references">References</a></li>
        </ul>
      </nav>

      <div class="fine">
        <p>A result describes preferences. It does not measure ability or mental health. Do not use it to diagnose or to hire.</p>
        <p>Your answers stay in this browser. Nothing goes to a server.
          <a href="https://www.privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener">Data Privacy Act of 2012 (Republic Act No. 10173)<span class="sr-only"> (opens in a new tab)</span></a></p>
        <p class="mark"><button class="mark-btn" onclick={() => folderDlg?.showModal()} aria-haspopup="dialog">© Typology</button></p>
      </div>
    </div>
  </footer>

  <!-- Folder dialog: opened from "© Typology". Esc or a click on the backdrop closes it. -->
  <dialog bind:this={folderDlg} class="folder-dlg" class:wide={filePhase === "open"} aria-label="Typology folder" onclose={() => (filePhase = "idle")} onclick={e => { if (e.target === folderDlg) folderDlg?.close(); }}>
    <button class="folder-x" onclick={() => folderDlg?.close()} aria-label="Close"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.4 2.3 8 6.9l4.6-4.6 1.1 1.1L9.1 8l4.6 4.6-1.1 1.1L8 9.1l-4.6 4.6-1.1-1.1L6.9 8 2.3 3.4z" fill="currentColor" /></svg></button>
    {#if filePhase !== "open"}
    <button class="folder-btn" onclick={openFile} aria-label="Open the file in the folder">
    <svg class="folder" class:rising={filePhase === "rising"} viewBox="0 0 220 190" aria-hidden="true">
      <defs>
        <linearGradient id="fd-front" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#fff4c2" /><stop offset="1" stop-color="#f7d777" /></linearGradient>
        <linearGradient id="fd-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9de8a" /><stop offset="1" stop-color="#eec25a" /></linearGradient>
        <filter id="fd-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="8" stdDeviation="6" flood-color="#3b302b" flood-opacity="0.25" /></filter>
      </defs>
      <g filter="url(#fd-shadow)">
        <path class="fd-back" d="M22 40 L30 26 H82 L96 42 H192 Q198 42 198 48 V160 H22 Z" fill="url(#fd-back)" />
        {#each [0, 1, 2] as i (i)}
          <g class="fd-paper p{i}">
            <rect x={44 + i * 10} y="46" width="120" height="100" rx="3" fill="#fff" stroke="#d9cfb8" stroke-width="2" />
            {#each [0, 1, 2, 3] as l (l)}<line x1={58 + i * 10} x2={(l === 3 ? 120 : 148) + i * 10} y1={64 + l * 14} y2={64 + l * 14} stroke="#cfc6b2" stroke-width="3" stroke-linecap="round" />{/each}
          </g>
        {/each}
        <g class="fd-file">
          <rect x="64" y="40" width="96" height="112" rx="3" fill="#fff" stroke="#c8922a" stroke-width="2.5" />
          <rect x="64" y="40" width="96" height="14" rx="3" fill="#e9eef5" />
          {#each [0, 1, 2, 3, 4] as l (l)}<line x1="74" x2={l % 2 ? 128 : 148} y1={66 + l * 13} y2={66 + l * 13} stroke="#9fb3c8" stroke-width="3" stroke-linecap="round" />{/each}
        </g>
        <path class="fd-front" d="M14 82 H86 L100 68 H204 Q211 68 210 75 L198 172 H24 Z" fill="url(#fd-front)" />
      </g>
    </svg>
    </button>
    {:else}
      <div class="editor" role="document" aria-label="index.js in a code editor">
        <div class="ed-tabs" aria-hidden="true"><span class="on">index.js</span></div>
        <ol class="ed-code">
          {#each CODE as line, n (n)}
            <li><span class="ln" aria-hidden="true">{n + 1}</span><span class="fold" aria-hidden="true"></span><code>{#each line as [c, t], k (k)}<span class={c}>{t}</span>{/each}</code></li>
          {/each}
        </ol>
      </div>
    {/if}
  </dialog>
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
    border: 1px solid #e8e3d8; border-top: 0;
    /* thin inner rule + drop shadow onto the sidebar, as in the reference */
    box-shadow: inset 0 0 0 3px var(--cream), inset 0 0 0 4px #ddd7ca, 4px 0 7px -1px rgb(60 30 15 / 0.35), -1px 0 0 rgb(255 255 255 / 0.35);
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
    background: #fbf9f3; border: 1px solid #b9aa9c;
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
  /* Top-level groups: bold header, separated from the previous group by space and a hairline. */
  .kw > li { padding: 0.45rem 0.75rem 0.45rem 0; }
  .kw > li + li { border-top: 1px solid rgb(31 93 116 / 0.25); }
  .kw-top { display: block; font: bold 11.5px var(--font-head); letter-spacing: 0.02em; color: #173f4f; }
  .kw ul { margin-top: 0.15rem; }
  .kw a { color: #1f5d74; }
  .edge { background: linear-gradient(90deg, #c9c1ba, var(--edge) 4px); }
  .warn { background: var(--cream-dark); padding: 0.4rem; }
  :global(.sr-only) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  /* ---------- footer ----------
     Centered, stacked rows (small links · fine print), on a light surface.
     Same columns as .body so it centres under the main panel. Links: accent 6.1:1, text 11:1, muted 5.4:1 on cream. */
  .foot {
    display: grid; grid-template-columns: var(--band) minmax(0, 1fr) var(--side) 10px;
    background: var(--c-page); border-top: 1px solid var(--c-line); color: var(--c-ink); font: 13px/1.6 var(--font-body);
  }
  .foot-grid { grid-column: 1 / -1; display: grid; justify-items: center; gap: 12px; padding: 20px 1.3rem 18px; text-align: center; }
  .foot a { color: var(--c-accent); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
  .foot a:hover { color: var(--c-accent-hover); text-decoration-thickness: 2px; }
  .foot a:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }

  /* Rows of items split by thin vertical rules (the modern take on pipes). */
  .row { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; row-gap: 6px; }
  .row li { padding: 0 12px; }
  .row li + li { border-left: 1px solid var(--c-line); }
  .links { font: 12px var(--font-head); }


  .fine { font-size: 10.5px; color: var(--c-muted); }
  .fine p { margin: 0 0 4px; }
  .mark { margin-top: 6px !important; font: 11.5px Georgia, "Times New Roman", serif; color: var(--c-ink); }

  .mark-btn { font: inherit; color: inherit; background: none; border: 0; padding: 2px 4px; cursor: pointer; border-radius: 2px; }
  .mark-btn:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }

  /* ---------- folder dialog ---------- */
  .folder-dlg.wide { width: min(560px, calc(100vw - 32px)); }
  .folder-dlg { position: fixed; inset: 0; margin: auto; width: min(200px, calc(100vw - 32px)); height: fit-content; padding: 0; border: 0; background: transparent; color: var(--white); overflow: visible; text-align: center; }
  .folder-dlg::backdrop { background: rgb(40 15 5 / 0.3); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  .folder-dlg[open] { animation: folder-in var(--dur) var(--ease-out); }
  @keyframes folder-in { from { opacity: 0; transform: scale(0.96); } }
  .folder-x { position: absolute; top: -6px; right: -6px; z-index: 1; display: grid; place-items: center; width: 34px; height: 34px; background: var(--c-surface); border: 0; border-radius: 50%; color: var(--c-ink); cursor: pointer; box-shadow: 0 2px 8px rgb(40 15 5 / 0.3); }
  .folder-x:hover { background: var(--white); }
  .folder-x:focus-visible { outline: 2px solid var(--white); outline-offset: 2px; }
  .folder-btn { display: block; margin: 0 auto; padding: 0; background: none; border: 0; cursor: pointer; border-radius: 4px; }
  .folder-btn:focus-visible { outline: 2px solid var(--white); outline-offset: 6px; }
  .folder { display: block; width: min(150px, 60vw); margin: 0 auto; overflow: visible; }
  .fd-back, .fd-front { stroke: #c8922a; stroke-width: 5; stroke-linejoin: round; }
  /* Papers sit inside the folder; on hover they rise and fan out one after another, and sink back on hover out. */
  .fd-paper, .fd-file { transform-box: fill-box; transform-origin: 50% 100%; transform: translateY(18px);
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms; }
  .fd-file { opacity: 0; }
  .p1 { transition-delay: 30ms; } .p2 { transition-delay: 60ms; }
  .fd-front { transform-box: fill-box; transform-origin: 50% 100%; transition: transform 380ms var(--ease-out); }
  .folder:hover .fd-paper { transition: transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1); }
  .folder:hover .p0 { transform: translateY(-34px) rotate(-9deg); transition-delay: 0ms; }
  .folder:hover .p1 { transform: translateY(-48px) rotate(1deg); transition-delay: 60ms; }
  .folder:hover .p2 { transform: translateY(-36px) rotate(10deg); transition-delay: 120ms; }
  .folder:hover .fd-front { transform: skewX(-4deg) scaleY(0.95); }
  /* Click: the papers drop back, one file rises out and grows; then the editor window takes its place. */
  .folder.rising .fd-paper { transform: translateY(18px); transition: transform 200ms ease-in; }
  .folder.rising .fd-file { opacity: 1; transform: translateY(-110px) scale(1.25); transition: transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 120ms; }
  .folder.rising .fd-front { transform: skewX(-4deg) scaleY(0.95); }

  /* Editor window (generic code-editor look). */
  .editor { text-align: left; color: #1e1e1e; background: #f0f0f0; border: 1px solid #8a8a8a; border-radius: 3px; box-shadow: 0 18px 50px rgb(0 0 0 / 0.35); overflow: hidden;
    font: 12px/1.4 var(--font-body); animation: ed-open 360ms cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: 50% 70%; }
  @keyframes ed-open { from { opacity: 0; transform: translateY(-40px) scale(0.25); } }
  .ed-tabs { display: flex; gap: 2px; padding: 8px 44px 0 6px; background: #e8e8e8; }
  .ed-tabs span { padding: 3px 10px; font-size: 11px; background: #d6dbe3; border: 1px solid #b8bfc9; border-bottom: 0; border-radius: 2px 2px 0 0; color: #444; }
  .ed-tabs span.on { background: #fff; color: #1e1e1e; border-top: 2px solid #f0a030; }
  .ed-code { list-style: none; margin: 0; padding: 4px 0 10px; background: #fff; font: 13px/1.6 var(--font-mono); }
  .ed-code li { display: grid; grid-template-columns: 2.6rem 1.2rem minmax(0, 1fr); align-items: stretch; }
  .ed-code code { white-space: pre-wrap; overflow-wrap: anywhere; padding-right: 10px; }
  .ln { padding-right: 8px; text-align: right; color: #8a8a8a; background: #f2f2f2; border-right: 1px solid #ddd; }
  .fold { color: #8a8a8a; text-align: center; font-size: 11px; }
  .ed-code code { font: inherit; color: #1e1e1e; }
  .ed-code .cm { color: #008000; }

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
    .foot { grid-template-columns: minmax(0, 1fr) var(--side); }
    .foot-grid { grid-column: 1 / -1; }
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
    .foot { grid-template-columns: minmax(0, 1fr); }
    .foot-grid { padding: 18px 16px 20px; gap: 10px; }
    .links a { display: inline-flex; align-items: center; min-height: 44px; }
  }
</style>
