<script lang="ts">
  /** Section heading. */
  let { text }: { text: string } = $props();
</script>

<h2 class="sec-head">{text}</h2>

<style>
  .sec-head { font: bold 1.05rem/1.3 var(--font-head); color: var(--teal-dark); margin: 0 0 0.5rem; }
</style>
