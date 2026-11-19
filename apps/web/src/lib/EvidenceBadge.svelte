<script lang="ts">
  import type { EvidenceLevel } from "@typo/engine-sdk";
  import { EVIDENCE_LABEL } from "./glossary.ts";
  let { level }: { level: EvidenceLevel } = $props();
</script>

<span class="badge {level}">{EVIDENCE_LABEL[level]}</span>

<style>
  .badge { font: bold 10px var(--font-head); text-transform: uppercase; letter-spacing: 0.08em; color: var(--white); padding: 0.1rem 0.45rem; background: var(--teal); }
  .moderate { background: var(--sky-dark); }
  .mixed { background: var(--tan); }
  .exploratory { background: var(--meta); }
</style>
