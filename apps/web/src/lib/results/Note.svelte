<script lang="ts">
  // A disclaimer. Inside the quiz modal it is collected into the one "notes" block at the end of the result.
  import { getContext, onMount } from "svelte";
  let { text }: { text: string } = $props();
  const notes = getContext<{ list: string[] } | undefined>("result-notes");
  onMount(() => {
    if (!notes) return;
    notes.list.push(text);
    return () => { const i = notes.list.indexOf(text); if (i >= 0) notes.list.splice(i, 1); };
  });
</script>

{#if !notes}<p class="rs-sub">{text}</p>{/if}
