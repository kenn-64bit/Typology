<script lang="ts">
  import type { EvidenceLevel } from "@typo/engine-sdk";
  let { code, confidence, answered, level, label = "Your result" }: { code: string; confidence: number; answered: number; level: EvidenceLevel; label?: string } = $props();
</script>

<h2 class="post-title">{label}</h2>
<p><span class="result-code">{code}</span></p>
<p class="meta">{Math.round(confidence * 100)}% confidence · {answered} answers</p>
