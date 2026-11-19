<script lang="ts">
  /** Section heading: icon + heading. */
  export type Icon = "overview" | "info" | "key" | "chart" | "puzzle" | "book" | "warning";
  let { icon, text }: { icon: Icon; text: string } = $props();
  const PATHS: Record<Icon, string> = {
    overview: "M2 2h12v12H2zm1.5 1.5v9h9v-9zM5 5h6v1.2H5zm0 2.4h6v1.2H5zm0 2.4h4v1.2H5z",
    info: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.9 3h1.8v1.8H7.1zm0 3h1.8v5H7.1z",
    key: "M5 5a4 4 0 1 1 3.9 4.9L8 11H6.5v1.5H5V14H2v-2.6l3.1-3.1A4 4 0 0 1 5 5zm4-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    chart: "M2 14h12v1H1V2h1zm2-2V8h2v4zm3 0V4h2v8zm3 0V6h2v6z",
    puzzle: "M3 3h3a1.5 1.5 0 1 1 3 0h3v3a1.5 1.5 0 1 1 0 3v3H9a1.5 1.5 0 1 0-3 0H3V9a1.5 1.5 0 1 0 0-3z",
    book: "M2 2.5C4 2 6 2.2 7.5 3.3V14C6 13 4 12.8 2 13.3zm12 0c-2-.5-4-.3-5.5.8V14c1.5-1 3.5-1.2 5.5-.7z",
    warning: "M8 1l7.5 13.5H.5zm-.9 4.5v4.5h1.8V5.5zm0 5.8v1.8h1.8v-1.8z",
  };
</script>

<h2 class="sec-head">
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d={PATHS[icon]} fill="currentColor" fill-rule="evenodd" /></svg>
  <span>{text}</span>
</h2>

<style>
  .sec-head { display: flex; align-items: center; gap: 0.45rem; font: bold 1.05rem/1.3 var(--font-head); color: var(--teal-dark); margin: 0 0 0.5rem; }
  .sec-head svg { color: var(--tan); flex: none; }
</style>
