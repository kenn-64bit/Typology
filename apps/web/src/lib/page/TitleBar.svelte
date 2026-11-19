<script lang="ts">
  /** Page title bar. */
  let { title }: { title: string } = $props();
</script>

<h1 class="title-bar">{title}</h1>

<style>
  .title-bar {
    font: bold 1.6rem/1.2 var(--font-title); color: var(--teal);
    padding: 0.4rem 0 0.6rem; border-bottom: 3px double var(--rule); margin-bottom: 0.8rem;
  }
</style>
