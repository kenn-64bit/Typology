<script lang="ts">
  /** Page top: banner image, then the title masthead between double rules. */
  let { title }: { title: string } = $props();
</script>

<div class="banner" role="img" aria-label="Decorative banner"></div>

<header class="mast">
  <h1 class="m-title"><span class="m-big">{title}</span></h1>
</header>

<style>
  .banner {
    height: clamp(110px, 18vw, 190px); margin: 2.7rem 0 0; /* clears the sidebar search box that overlaps the panel edge */ position: relative; overflow: hidden;
    background: var(--rust-texture); box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.15);
  }

  /* masthead between double rules, like the reference */
  .mast {
    display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;
    margin: 0.9rem 0 1.3rem; padding: 0.55rem 0; border-top: 3px double var(--rule); border-bottom: 3px double var(--rule);
  }
  .m-title { margin: 0; text-align: center; }
  .m-big { font: bold 1.9rem/1.1 Georgia, "Times New Roman", serif; color: var(--rust); text-transform: uppercase; letter-spacing: 0.06em; }

  @media (max-width: 760px) {
    .banner { margin-top: 0.4rem; }
    .m-big { font-size: 1.5rem; }
  }
</style>
