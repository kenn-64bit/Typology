<script lang="ts">
  // Site search box (sidebar and mobile menu). See ./index.ts for the security rules.
  import { goto } from "$app/navigation";
  import { loadIndex, search, snippet, MAX_QUERY, type Entry, type Hit } from "./index.ts";

  let { id }: { id: string } = $props();
  let q = $state("");
  let debounced = $state("");
  let index = $state<Entry[]>([]);
  let active = $state(-1);
  const listId = $derived(`${id}-list`);

  $effect(() => {
    const v = q;
    const t = setTimeout(() => { debounced = v; active = -1; }, 120);
    return () => clearTimeout(t);
  });
  const hits: Hit[] = $derived(search(index, debounced));
  const open = $derived(debounced.trim().length >= 2);

  function load() { loadIndex().then(x => (index = x)); }
  function go(h: Hit | undefined) {
    if (!h) return;
    q = ""; debounced = ""; active = -1;
    goto(h.href);
  }
  function onkey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" && hits.length) { e.preventDefault(); active = (active + 1) % hits.length; }
    else if (e.key === "ArrowUp" && hits.length) { e.preventDefault(); active = active <= 0 ? hits.length - 1 : active - 1; }
    else if (e.key === "Escape" && q) { e.preventDefault(); e.stopPropagation(); q = ""; debounced = ""; }
  }
</script>

<form class="search" role="search" onsubmit={e => { e.preventDefault(); go(hits[active] ?? hits[0]); }}>
  <label class="sr-only" for={id}>Search the site</label>
  <input {id} type="search" bind:value={q} maxlength={MAX_QUERY} autocomplete="off" spellcheck="false"
    role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
    onfocus={load} oninput={() => { if (q.length > MAX_QUERY) q = q.slice(0, MAX_QUERY); }} onkeydown={onkey} />
  <button class="search-go" type="submit" aria-label="Search">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6.5 1a5.5 5.5 0 0 1 4.4 8.8l3.9 3.9-1.1 1.1-3.9-3.9A5.5 5.5 0 1 1 6.5 1zm0 1.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8z" fill="currentColor" /></svg>
  </button>
</form>
{#if open}
  <ul class="kw-results" id={listId} role="listbox" aria-label="Search results">
    {#each hits as h, i (h.href + h.title + i)}
      <li id="{listId}-{i}" role="option" aria-selected={i === active} class:on={i === active}>
        <a href={h.href} tabindex="-1" onclick={e => { e.preventDefault(); go(h); }}>
          <span class="r-title">{h.title}</span>
          <small class="r-where">{h.where}</small>
          <span class="r-snip">{#each snippet(h.text, debounced) as s, k (k)}{#if s.hit}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}</span>
        </a>
      </li>
    {:else}
      <li class="none" role="option" aria-selected="false" aria-disabled="true">No matches for “{debounced.trim()}”</li>
    {/each}
  </ul>
{/if}

<style>
  .search-go { flex: none; display: grid; place-items: center; width: 26px; height: 26px; padding: 0; color: #1f5d74; background: none; border: 0; cursor: pointer; border-radius: 2px; }
  .search-go:hover { color: #173f4f; }
  .search-go:focus-visible { outline: 2px solid #1f5d74; outline-offset: 1px; }
  .kw-results li { list-style: none; }
  .kw-results a { display: grid; gap: 1px; padding: 0.35rem 0.4rem; color: #1e2a30; text-decoration: none; border-radius: 2px; }
  .kw-results li.on a, .kw-results a:hover { background: rgb(31 93 116 / 0.1); }
  .r-title { font: bold var(--fs-sm) var(--font-head); color: #173f4f; }
  .r-where { font-size: var(--fs-xs); color: #4d6a75; }
  .r-snip { font-size: var(--fs-xs); line-height: 1.45; color: #333; overflow-wrap: anywhere; }
  .r-snip mark { background: rgb(240 190 70 / 0.55); color: inherit; padding: 0 1px; }
  .none { padding: 0.35rem 0.4rem; font-size: var(--fs-sm); color: #4d6a75; overflow-wrap: anywhere; }
</style>
