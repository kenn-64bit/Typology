<script lang="ts">
  // Attitudinal Psyche page text: CONTENT.md §8. Do not reword.
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
    ["1st", "strong", "CONFIDENT", "sure, firm, shows it freely", "V", "Volition"],
    ["2nd", "strong", "FLEXIBLE", "skilled, open, adapts to others", "L", "Logic"],
    ["3rd", "weak", "INSECURE", "sensitive, wants to improve, can be hurt", "E", "Emotion"],
    ["4th", "weak", "INDIFFERENT", "low priority, not worried about it", "F", "Physics"],
  ];
</script>

<TypologyLayout {t} {result} title="Attitudinal Psyche"
  facts={["4 ASPECTS", "4 POSITIONS", "24 TYPES"]}
  format="About 4–8 rankings · all on one page"
  extra="Drag the four statements into order, from most like you to least like you. You can also use the arrow buttons.">

  {#snippet overview()}
    <p>Attitudinal Psyche (AP) looks at four parts of life: will, logic, emotion and the body. It does not ask how much of each you have. It asks how you feel about each one. Are you sure of yourself here? Do you adapt to others? Do you feel unsure? Or do you not care much?</p>
    <p>Think of a group dinner. One person decides where to eat and does not ask twice. One person explains why the food is healthy. One person worries that their mood spoils the evening. One person does not mind what they eat. Each person shows a different attitude to a different part of life.</p>
    <p>AP puts the four aspects in an order from 1st to 4th. The order shows your confidence and openness in each area. There are 24 possible orders.</p>
    <p>Many people find AP useful for relationships. It can explain why one remark hurts you deeply, but another person does not even notice it. It can also show where you can support others and where you may need support.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Volition (will).</strong> Your attitude to decisions, power and control. It shows how sure you are about what you want.</ChipRow>
    <ChipRow label="L:" href={g}><strong>Logic.</strong> Your attitude to reason, facts and ideas. It shows how sure you are about what you think.</ChipRow>
    <ChipRow label="E:" href={g}><strong>Emotion.</strong> Your attitude to feelings and how you show them. It shows how sure you are about what you feel.</ChipRow>
    <ChipRow label="F:" href={g}><strong>Physics (body).</strong> Your attitude to the body, comfort and material things. The letter F comes from the Russian word "fizika".</ChipRow>
    <ArrowRow>The order shows the position of each aspect, from 1st to 4th. The 1st letter is the aspect you feel most confident in. The 4th letter is the one you care about least.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="dg-table ap" role="table" aria-label="The four Attitudinal Psyche positions">
      <div class="dg-row dg-head" role="row"><span role="columnheader">Position</span><span role="columnheader">Strength</span><span role="columnheader">Attitude</span><span role="columnheader">Example: V L E F</span></div>
      {#each ROWS as [pos, str, att, desc, l, name] (pos)}
        <div class="dg-row" class:split={pos === "3rd"} role="row">
          <b role="cell">{pos}</b><span role="cell" class:weak={str === "weak"} class="str">{str}</span>
          <span role="cell"><b>{att}:</b> {desc}</span>
          <span role="cell"><a class="dg-letter" href={g}>{l}</a> {name}</span>
        </div>
      {/each}
    </div>
    <p class="dg-note">The top two positions are strong: you feel sure in these areas. The bottom two are weak: you feel unsure or uninterested. The example shows one of the 24 orders.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The four aspects</h3>
    <ChipRow label="V:" href={g}><strong>Volition (will)</strong><br />Your will, decisions and power. How you set your own direction and deal with other people's will. Strong V: you decide fast and do not need approval. Weak V: you may wait for others to decide, or feel hurt when someone overrules you.</ChipRow>
    <ChipRow label="L:" href={g}><strong>Logic (mind)</strong><br />Reason, facts, ideas and arguments. How you understand and explain the world. Strong L: you trust your own reasoning and enjoy a debate. Weak L: you may avoid arguments, or feel stupid when someone corrects you.</ChipRow>
    <ChipRow label="E:" href={g}><strong>Emotion (soul)</strong><br />Feelings, mood and emotional expression. How you show and receive emotion. Strong E: you show feelings freely and can lift the mood of a room. Weak E: you may hide feelings, or feel awkward when others cry.</ChipRow>
    <ChipRow label="F:" href={g}><strong>Physics (body)</strong><br />The body, health, comfort, money and material things. How you deal with the physical world. Strong F: you know what your body needs and handle money and objects with ease. Weak F: you may forget to eat, or feel unsure about your looks.</ChipRow>

    <h3 class="sub">The four positions</h3>
    <ChipRow label="1st:" href={g}><strong>Confident</strong><br />This aspect is your strongest. You trust your own view here and show it openly. You do not need other people's input. You may push your view on others without noticing.</ChipRow>
    <ChipRow label="2nd:" href={g}><strong>Flexible</strong><br />This aspect is also strong. You use it with skill and you adapt it to other people. You listen to other views and enjoy working together here. Many people say this is where they are most helpful to others.</ChipRow>
    <ChipRow label="3rd:" href={g}><strong>Insecure</strong><br />This aspect is weak and sensitive. You want to improve here, and criticism can hurt. A careless remark in this area can stay with you for days. Gentle support here can mean a lot to you.</ChipRow>
    <ChipRow label="4th:" href={g}><strong>Indifferent</strong><br />This aspect is weak, but it does not worry you. You give it low priority. You may happily let others take the lead here. You may also miss problems in this area until they grow.</ChipRow>
    <ChipRow label="NOTE:">Some sources call the 4th position "Unbothered". This site uses "Indifferent".</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the four letters from left to right.</ArrowRow>
    <ArrowRow>The first letter is your Confident aspect. The last letter is your Indifferent aspect.</ArrowRow>
    <ArrowRow>Example: <code>VLEF</code> = Confident Volition, Flexible Logic, Insecure Emotion, Indifferent Physics. This person decides firmly, discusses ideas openly, feels unsure about showing emotion and gives little thought to comfort or looks.</ArrowRow>
    <ArrowRow>Pay special attention to your 3rd aspect. It often explains your most sensitive spots in relationships.</ArrowRow>
    <ArrowRow>Compare with a partner or friend. Your 1st aspect may be their 3rd. Then your confident style can hurt them without you knowing.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>AP "Logic" is not Jungian "Thinking".</strong> AP Logic is your attitude to reason. It does not show how you make decisions.</ArrowRow>
    <ArrowRow><strong>"Physics" does not mean the science.</strong> Here it means the body and the material world.</ArrowRow>
    <ArrowRow><strong>Physics uses F, not P.</strong> The letter comes from the Russian word.</ArrowRow>
    <ArrowRow><strong>Temporistics uses the same 1st–4th idea.</strong> But it ranks time, not these four aspects.</ArrowRow>
    <ArrowRow><strong>A 1st aspect is not a talent.</strong> It shows confidence, not skill. You can be confident in an area and still make mistakes there.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .ap :global(.dg-row) { grid-template-columns: 4rem 4.5rem minmax(0, 1.6fr) minmax(0, 1fr); }
  .str { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--rust); }
  .str.weak { color: var(--meta); }
  .ap :global(.dg-row.split) { border-top: 2px solid var(--tan); }
  @media (max-width: 760px) {
    .ap :global(.dg-row) { grid-template-columns: 3rem 4rem minmax(0, 1fr); }
    .ap :global(.dg-row > :last-child) { grid-column: 3; }
    .ap :global(.dg-head > :last-child) { display: none; }
  }
</style>
