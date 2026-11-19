<script lang="ts">
  // Result hero: the code is the largest thing on the screen; confidence and answer count sit quietly below.
  let { code, confidence, answered, label = "Your result" }: { code: string; confidence?: number; answered: number; label?: string } = $props();
</script>

<header class="rs-hero">
  <h3 class="rs-k">{label}</h3>
  <p class="rs-code">{code}</p>
  <p class="rs-sub">{#if confidence !== undefined}{Math.round(confidence * 100)}% confidence{" · "}{/if}{answered} answers</p>
</header>
