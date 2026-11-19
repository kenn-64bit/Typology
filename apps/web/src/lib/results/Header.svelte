<script lang="ts">
  let { code, confidence, answered, label = "Your result" }: { code: string; confidence: number; answered: number; label?: string } = $props();
</script>

<h2 class="post-title">{label}</h2>
<p><span class="result-code">{code}</span></p>
<p class="meta">{Math.round(confidence * 100)}% confidence · {answered} answers</p>
