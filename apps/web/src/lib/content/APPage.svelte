<script lang="ts">
  // Attitudinal Psyche page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#ap";
  const ROWS = [
    ["1st", "strong", "confident", "sure, firm, shows it freely", "V", "Volition"],
    ["2nd", "strong", "flexible", "skilled, listens, adapts to others", "L", "Logic"],
    ["3rd", "weak", "insecure", "sensitive, easily hurt, wants to improve", "E", "Emotion"],
    ["4th", "weak", "indifferent", "low priority, does not worry about it", "F", "Physics"],
  ];
</script>

<TypologyLayout {t} {result} title="Attitudinal Psyche"
  facts={["4 aspects", "4 positions", "24 possible orders"]}
  format="4 to 8 rankings on one page"
>

  {#snippet overview()}
    <p>Attitudinal Psyche (AP) looks at four areas of life: will, logic, emotion and the body. It does not measure how much of each you have. It asks about your attitude to each one. In this area, are you sure of yourself? Do you adapt to other people? Do you feel unsure? Or do you not care much?</p>
    <p>Think of a group dinner. One person chooses the restaurant and does not ask anyone. One person explains why the food is healthy. One person worries that their bad mood will spoil the evening. One person does not mind what they eat. Each person has a different attitude to a different area.</p>
    <p>AP puts the four aspects in order from 1st to 4th. The order shows how confident and how open you are in each area. There are 24 possible orders.</p>
    <p>The order can explain why one remark hurts you badly while another person does not notice it. It can also show where you can help other people and where you may need help.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Volition (will).</strong> Your attitude to decisions, power and control: how sure you are about what you want.</ChipRow>
    <ChipRow label="L:" href={g}><strong>Logic.</strong> Your attitude to reason, facts and ideas: how sure you are about what you think.</ChipRow>
    <ChipRow label="E:" href={g}><strong>Emotion.</strong> Your attitude to feelings and how you show them: how sure you are about what you feel.</ChipRow>
    <ChipRow label="F:" href={g}><strong>Physics (body).</strong> Your attitude to the body, comfort and material things. The letter F comes from the Russian word "fizika".</ChipRow>
    <ArrowRow>The code gives the four aspects in order, from 1st to 4th. You feel most confident in the 1st. You care least about the 4th.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">V L E F</code></p>
      <div class="ap" role="table" aria-label="The four Attitudinal Psyche positions">
        <div class="ap-row ap-head" role="row"><span class="fx-k" role="columnheader">Position</span><span class="fx-k" role="columnheader">Strength</span><span class="fx-k" role="columnheader">Attitude</span><span class="fx-k" role="columnheader">Example</span></div>
        {#each ROWS as [pos, str, att, desc, l, name] (pos)}
          <div class="ap-row" class:split={pos === "3rd"} role="row">
            <span class="pos" role="cell">{pos}</span>
            <span class="fx-k" class:strong={str === "strong"} role="cell">{str}</span>
            <span role="cell"><b class="att">{att}</b> {desc}</span>
            <span class="exl" role="cell"><a class="lt on" href={g}>{l}</a> <span>{name}</span></span>
          </div>
        {/each}
      </div>
      <p class="fx-cap">Top two positions are strong, bottom two weak. The example is one of 24 orders.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The four aspects</h3>
    <ChipRow label="V:" href={g}><strong>Volition (will)</strong><br />Your will, decisions and power: how you choose your direction and how you react to what other people want. Strong V: you decide quickly and do not need approval. Weak V: you may wait for others to decide, or feel hurt when someone overrules you.</ChipRow>
    <ChipRow label="L:" href={g}><strong>Logic (mind)</strong><br />Reason, facts, ideas and arguments: how you understand and explain the world. Strong L: you trust your own reasoning and enjoy a debate. Weak L: you may avoid arguments, or feel stupid when someone corrects you.</ChipRow>
    <ChipRow label="E:" href={g}><strong>Emotion (soul)</strong><br />Feelings and mood: how you show emotion and how you react to other people's emotion. Strong E: you show your feelings freely and can change the mood of a room. Weak E: you may hide your feelings, or feel awkward when someone cries.</ChipRow>
    <ChipRow label="F:" href={g}><strong>Physics (body)</strong><br />The body, health, comfort, money and material things: how you deal with the physical world. Strong F: you know what your body needs, and money and objects are easy for you. Weak F: you may forget to eat, or feel unsure about your appearance.</ChipRow>

    <h3 class="sub">The four positions</h3>
    <ChipRow label="1st:" href={g}><strong>Confident</strong><br />This is your strongest aspect. Here you trust your own view and show it openly, and you do not need other people's opinion. You may push your view on others and not notice.</ChipRow>
    <ChipRow label="2nd:" href={g}><strong>Flexible</strong><br />This aspect is also strong. You use it with skill, and you adapt it to other people. Here you listen to other views and like to work together. You can often help other people most in this area.</ChipRow>
    <ChipRow label="3rd:" href={g}><strong>Insecure</strong><br />This aspect is weak and sensitive. You want to improve here, and criticism hurts. A careless remark about it can stay with you for days. Kind support in this area can mean a lot to you.</ChipRow>
    <ChipRow label="4th:" href={g}><strong>Indifferent</strong><br />This aspect is weak, but it does not worry you. It has low priority for you, and you are happy to let others lead here. You may not see a problem in this area until it becomes large.</ChipRow>
    <ChipRow label="note:">Some sources call the 4th position "Unbothered". This site uses "Indifferent".</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the four letters from left to right.</ArrowRow>
    <ArrowRow>The first letter is your Confident aspect. The last letter is your Indifferent aspect.</ArrowRow>
    <ArrowRow>Example: <code>VLEF</code> is Confident Volition, Flexible Logic, Insecure Emotion and Indifferent Physics. This person decides firmly, discusses ideas openly, is unsure about showing emotion and thinks little about comfort or appearance.</ArrowRow>
    <ArrowRow>Look carefully at your 3rd aspect. It often explains where you are most sensitive with other people.</ArrowRow>
    <ArrowRow>Compare your order with a partner's or a friend's. If your 1st aspect is their 3rd, your confidence there can hurt them and you may not know it.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>AP Logic is not Jungian Thinking.</strong> AP Logic is your attitude to reason. It does not describe how you make decisions.</ArrowRow>
    <ArrowRow><strong>"Physics" does not mean the science.</strong> Here it means the body and the material world.</ArrowRow>
    <ArrowRow><strong>Physics uses F, not P.</strong> The letter comes from the Russian word.</ArrowRow>
    <ArrowRow><strong>Temporistics also uses positions 1st to 4th,</strong> but it puts four categories of time in order, not these four aspects.</ArrowRow>
    <ArrowRow><strong>A 1st aspect is not a talent.</strong> It shows confidence, not skill. You can be confident in an area and still make mistakes there.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .ap-row { display: grid; grid-template-columns: 3.5rem 5rem minmax(0, 1fr) 9rem; column-gap: var(--fx-3); padding: var(--fx-2) 0; align-items: baseline; }
  .ap-head { padding-top: 0; }
  .split { border-top: 1px solid var(--fx-line); margin-top: var(--fx-2); padding-top: var(--fx-3); }
  .pos { font: bold 13px var(--font-head); }
  .strong { color: var(--text); }
  .att { font: bold 12px var(--font-head); margin-right: var(--fx-1); }
  .exl .lt { font-size: 16px; margin-right: var(--fx-1); }
  .exl span { color: var(--meta); }
  @media (max-width: 760px) {
    .ap-head { display: none; }
    .ap-row { grid-template-columns: 3rem minmax(0, 1fr) 4.5rem; row-gap: 2px; }
    .ap-row > :nth-child(2) { grid-column: 1; grid-row: 2; }
    .ap-row > :nth-child(3) { grid-column: 2; grid-row: 1 / span 2; }
    .ap-row > :nth-child(4) { grid-column: 3; grid-row: 1; text-align: right; }
    .exl span { display: block; font-size: 11px; }
  }
</style>
