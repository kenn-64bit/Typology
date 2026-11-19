<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { BigFiveResult as BF } from "@typo/engine-bigfive";
  import type { MotivesResult as MO } from "@typo/engine-motives";
  import type { TemperamentResult as TE } from "@typo/engine-temperament";
  import type { JungResult as JU } from "@typo/engine-jung";
  import type { EnneaResult as EN } from "@typo/engine-enneagram";
  import type { RankResult as RK } from "@typo/rank-engine";
  import type { Typology } from "$lib/typologies.ts";
  import BigFiveResult from "$lib/results/BigFiveResult.svelte";
  import MotivesResult from "$lib/results/MotivesResult.svelte";
  import TemperamentResult from "$lib/results/TemperamentResult.svelte";
  import JungResult from "$lib/results/JungResult.svelte";
  import EnneagramResult from "$lib/results/EnneagramResult.svelte";
  import OrderResult from "$lib/results/OrderResult.svelte";
  import BigFivePage from "$lib/content/BigFivePage.svelte";
  import MotivesPage from "$lib/content/MotivesPage.svelte";
  import TemperamentPage from "$lib/content/TemperamentPage.svelte";
  import JungPage from "$lib/content/JungPage.svelte";
  import EnneagramPage from "$lib/content/EnneagramPage.svelte";
  import APPage from "$lib/content/APPage.svelte";
  import TemporisticsPage from "$lib/content/TemporisticsPage.svelte";

  let { data } = $props();
  const t = $derived(data.t);
  const AP = { V: "Volition (will)", L: "Logic", E: "Emotion", F: "Physics (body, material world)" };
  const TP = { N: "Present", V: "Eternity", B: "Future", P: "Past" };
  const PAGES: Record<string, Component<{ t: Typology; result: Snippet<[unknown, number]> }>> = {
    bigfive: BigFivePage, motives: MotivesPage, temperament: TemperamentPage, jung: JungPage,
    enneagram: EnneagramPage, ap: APPage, temporistics: TemporisticsPage,
  };
  const Page = $derived(PAGES[t.slug]!);
</script>

{#snippet result(r: unknown, n: number)}
  {#if t.slug === "bigfive"}<BigFiveResult r={r as BF} answered={n} />
  {:else if t.slug === "motives"}<MotivesResult r={r as MO} answered={n} />
  {:else if t.slug === "temperament"}<TemperamentResult r={r as TE} answered={n} />
  {:else if t.slug === "jung"}<JungResult r={r as JU} answered={n} />
  {:else if t.slug === "enneagram"}<EnneagramResult r={r as EN} answered={n} />
  {:else if t.slug === "ap"}<OrderResult r={r as RK} answered={n} names={AP} caveat="This is an exploratory order of which aspects you put first. It does not measure the confident, flexible, insecure or indifferent attitudes that AP theory describes." />
  {:else}<OrderResult r={r as RK} answered={n} names={TP} />{/if}
{/snippet}

{#key t.slug}<Page {t} {result} />{/key}
