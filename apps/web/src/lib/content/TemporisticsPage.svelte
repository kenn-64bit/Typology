<script lang="ts">
  // Temporistics page. Base text: CONTENT.md §9, expanded for depth (owner request, 2026-11-19).
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#temporistics";
  const ROWS = [
    { aspect: "Past", letter: "P", q: "\"Who am I?\"", linked: "experience, causes, history, tradition" },
    { aspect: "Present", letter: "N", q: "\"Where is my place?\"", linked: "short-term events, being involved, the real situation" },
    { aspect: "Future", letter: "B", q: "\"Where am I going?\"", linked: "goals, strategy, plans, possibilities" },
    { aspect: "Eternity", letter: "V", q: "\"Why am I?\"", linked: "meaning, significance, a view of your life from a distance" },
  ];
  const EXAMPLE = [["1st", "N (Present)"], ["2nd", "V (Eternity)"], ["3rd", "B (Future)"], ["4th", "P (Past)"]];
</script>

<TypologyLayout {t} {result} title="Temporistics"
  facts={["4 ASPECTS", "4 POSITIONS", "24 TYPES"]}
  format="About 4–8 rankings · all on one page"
  extra="Drag the four statements into order, from most like you to least like you. If you took Attitudinal Psyche, this format is the same.">

  {#snippet overview()}
    <p>Everyone lives in time, but people do not give the same attention to every part of it. Some people keep old photos, tell family stories and learn from history. Other people live for today. They react fast and feel most alive in the middle of events. Some people always plan the next step. Other people ask what their life means as a whole.</p>
    <p>Temporistics puts these four directions into one order. It gives each one a letter: Past (P), Present (N), Future (B) and Eternity (V). Your type is the order of the four letters, from the time you give the most energy to the time you give the least.</p>
    <p>The order can explain everyday friction. A Future-first person may feel that a Past-first friend "lives in the old days". The Past-first friend may feel that the planner "forgets where they came from". Neither person is wrong. They put their energy into different times.</p>
    <p>Use your result as a mirror, not as a label. It can help you notice what you pay attention to and what you skip. It can also help you understand people who rank time differently from you.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ChipRow label="N:" href={g}><strong>Present.</strong> The letter comes from the Russian word "nastoyashchee" (present). It stands for what happens now and your part in it.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Eternity.</strong> The letter comes from the Russian word "vechnost" (eternity). It stands for meaning and the view of your life as a whole.</ChipRow>
    <ChipRow label="B:" href={g}><strong>Future.</strong> The letter comes from the Russian word "budushchee" (future). It stands for goals, plans and what can still happen.</ChipRow>
    <ChipRow label="P:" href={g}><strong>Past.</strong> The letter comes from the Russian word "proshloe" (past). It stands for memory, experience and where you come from.</ChipRow>
    <ArrowRow>The letters come from the Russian words for each aspect. So they do not match the English words. Read them as names, not as abbreviations.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="dg-table tp" role="table" aria-label="The four aspects of Temporistics">
      <div class="dg-row dg-head" role="row"><span role="columnheader">Aspect</span><span role="columnheader">Letter</span><span role="columnheader">The question it answers</span><span role="columnheader">Linked to</span></div>
      {#each ROWS as r (r.letter)}
        <div class="dg-row" role="row"><b role="cell">{r.aspect}</b><span role="cell"><a class="dg-letter" href={g}>{r.letter}</a></span><span role="cell" class="q">{r.q}</span><span role="cell">{r.linked}</span></div>
      {/each}
    </div>
    <ol class="dg-track" aria-label="Positions from most energy to least energy">
      {#each EXAMPLE as [pos, ex], i (pos)}
        <li><b>{pos}</b>{#if i === 0}<small>most energy</small>{:else if i === 3}<small>least energy</small>{/if}<span><small>EXAMPLE:</small> <a class="dg-letter" href={g}>{ex.slice(0, 1)}</a> {ex.slice(2)}</span></li>
      {/each}
    </ol>
    <p class="dg-note">Each aspect answers one question about your life. Your type puts the four questions in order, from the one you think about most to the one you think about least.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The four aspects</h3>
    <ChipRow label="P:" href={g}><strong>Past.</strong> Answers "Who am I?" It covers your experience, the causes of events, history and tradition. A strong Past looks for the roots of things. It asks "How did we get here?" before it acts. You may keep journals, enjoy family history or learn a skill by studying how others did it. A weak Past may repeat old mistakes, because it does not look back.</ChipRow>
    <ChipRow label="N:" href={g}><strong>Present.</strong> Answers "Where is my place?" It covers what happens now, your involvement in it and your sense of reality. A strong Present notices the mood of a room and reacts to it. You may be good in a crisis, because you see what the moment needs. A weak Present may miss what happens around it, because the mind is somewhere else.</ChipRow>
    <ChipRow label="B:" href={g}><strong>Future.</strong> Answers "Where am I going?" It covers goals, strategy, plans and what you can become. A strong Future always has a next step. You may enjoy planning trips, careers or projects more than living them. A weak Future may drift, because it does not set a direction.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Eternity.</strong> Answers "Why am I?" It covers meaning and significance. It is a view of your whole life from a distance. A strong Eternity asks whether something matters at all. You may enjoy philosophy, faith or long talks about purpose. A weak Eternity may feel lost when someone asks "What is it all for?"</ChipRow>

    <h3 class="sub">The four positions</h3>
    <ArrowRow>The theory uses Afanasyev's position model. The position tells how much energy you give an aspect. It does not tell how good or bad you are at it.</ArrowRow>
    <ChipRow label="1st:">You put the most energy into this aspect. It can be too strong. It is the lens you see everything through. Other people notice it first. Example: a 1st Future turns a dinner talk into a plan.</ChipRow>
    <ChipRow label="2nd:">You use this aspect with a normal, healthy level of energy. It works as a tool. You use it when you need it, and you can put it down again. It often supports your 1st aspect.</ChipRow>
    <ChipRow label="3rd:">This aspect is weak. You may handle it badly or feel unsure about it. You may also feel that you should be better at it. Kind help from others in this area can mean a lot to you.</ChipRow>
    <ChipRow label="4th:">This aspect has the least weight for you. You give it little attention. It does not worry you much. Other people may see a blind spot here before you do.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the four letters from left to right, from most energy to least energy.</ArrowRow>
    <ArrowRow>Example: <code>NVBP</code> = 1st Present, 2nd Eternity, 3rd Future, 4th Past. This person lives in the moment and asks what it means. Plans feel harder. Old history gets little attention.</ArrowRow>
    <ArrowRow>Look at your 1st and 4th letters first. They show the biggest contrast. Then look at the 3rd letter. It often shows where you want support.</ArrowRow>
    <ArrowRow>Compare your order with people close to you. Two people with opposite orders often see the same event in very different ways.</ArrowRow>
    <ArrowRow>Some sources give each of the 24 types a nickname. Example: some guides call <code>NVBP</code> "the Politician". Nicknames can differ between sources.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>V means Eternity, not Volition.</strong> In Attitudinal Psyche, V means Volition. In Temporistics, V means Eternity. Both systems use Russian letters, so the same letter can mean different things.</ArrowRow>
    <ArrowRow><strong>N means Present, not Intuition.</strong> The letter comes from the Russian word for "present". It has no link to Jungian or MBTI N.</ArrowRow>
    <ArrowRow><strong>B means Future.</strong> It does not stand for any English word.</ArrowRow>
    <ArrowRow><strong>A 4th aspect is not a flaw.</strong> It shows where you spend less energy. Everyone has a 4th aspect.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .tp :global(.dg-row) { grid-template-columns: 6rem 3.5rem minmax(0, 1fr) minmax(0, 1.4fr); }
  .q { font-weight: bold; color: var(--rust); }
  @media (max-width: 760px) {
    .tp :global(.dg-row) { grid-template-columns: 5rem 2.5rem minmax(0, 1fr); }
    .tp :global(.dg-row > :last-child) { grid-column: 3; }
    .tp :global(.dg-head > :last-child) { display: none; }
  }
</style>
