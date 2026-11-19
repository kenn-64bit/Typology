<script lang="ts">
  // Temporistics page.
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
  facts={["4 aspects of time", "4 positions", "24 possible orders"]}
  format="7 rankings on one page"
>

  {#snippet overview()}
    <p>Everyone lives in time, but people do not give the same attention to each part of it. Some people keep old photos, tell family stories and learn from history. Some live for today: they react quickly and feel most alive when things happen around them. Some always plan the next step. Some ask what their life means as a whole.</p>
    <p>Temporistics puts these four directions in one order and gives each one a letter: Past (P), Present (N), Future (B) and Eternity (V). Your type is the four letters in order, from the time you give the most energy to the time you give the least.</p>
    <p>The order can explain small conflicts between people. A Future-first person may think that a Past-first friend "lives in the old days". The friend may think that the planner "forgets where they came from". Neither person is wrong. They give their energy to different times.</p>
    <p>Your result shows which times get your attention and which you ignore. It does not predict what you will do.</p>
    <p><strong>What this test measures.</strong> The test finds which times you rank first and last across seven questions. It does not measure an amount of energy, insecurity or belief. The positions below come from the theory. If your rankings disagree, the result says so instead of giving an order.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ChipRow label="N:" href={g}><strong>Present.</strong> From the Russian word "nastoyashchee" (present): what happens now and your part in it.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Eternity.</strong> From the Russian word "vechnost" (eternity): meaning, and your life seen as a whole.</ChipRow>
    <ChipRow label="B:" href={g}><strong>Future.</strong> From the Russian word "budushchee" (future): goals, plans and what can still happen.</ChipRow>
    <ChipRow label="P:" href={g}><strong>Past.</strong> From the Russian word "proshloe" (past): memory, experience and where you come from.</ChipRow>
    <ArrowRow>Because the letters come from Russian, they do not match the English words. Read them as names, not as abbreviations.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">{EXAMPLE.map(e => e[1][0]).join("")}</code></p>
      <div class="tp" role="table" aria-label="The four aspects of Temporistics">
        <div class="col keys" aria-hidden="true"><span class="fx-k">Aspect</span><span class="fx-k">The question it answers</span><span class="fx-k">Linked to</span></div>
        {#each ROWS as r (r.letter)}
          <div class="col" role="row">
            <span role="rowheader"><a class="lt big" href={g}>{r.letter}</a> <span class="fx-k">{r.aspect}</span></span>
            <span role="cell" class="q">{r.q}</span>
            <span role="cell" class="linked">{r.linked}</span>
          </div>
        {/each}
      </div>
      <h3 class="fx-k sub">Energy, in the example's order</h3>
      <ol class="track" aria-label="Positions from most energy to least energy">
        {#each EXAMPLE as [pos, ex], i (pos)}
          <li style="--w: {4 - i}px"><span class="fx-k">{pos}{#if i === 0} · most energy{:else if i === 3} · least energy{/if}</span><span><a class="lt on" href={g}>{ex.slice(0, 1)}</a> {ex.slice(2)}</span></li>
        {/each}
      </ol>
      <p class="fx-cap">Your type orders the four questions from most to least thought about.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The four aspects</h3>
    <ChipRow label="P:" href={g}><strong>Past.</strong> Answers "Who am I?" It covers your experience, the causes of events, history and tradition. A strong Past looks for where things began, and asks "How did we get here?" before it acts. You may keep a diary, like family history, or learn a skill by studying how others learned it. A weak Past may repeat old mistakes, because it does not look back.</ChipRow>
    <ChipRow label="N:" href={g}><strong>Present.</strong> Answers "Where is my place?" It covers what happens now, your part in it and your sense of what is real. A strong Present feels the mood of a room and reacts to it. You may be good in a crisis, because you see what is needed now. A weak Present may not see what happens nearby, because the mind is somewhere else.</ChipRow>
    <ChipRow label="B:" href={g}><strong>Future.</strong> Answers "Where am I going?" It covers goals, strategy, plans and what you can become. A strong Future always has a next step. You may enjoy planning a trip, a career or a project more than doing it. A weak Future may have no direction, because it does not choose one.</ChipRow>
    <ChipRow label="V:" href={g}><strong>Eternity.</strong> Answers "Why am I?" It covers meaning and importance: your whole life seen from a distance. A strong Eternity asks if something matters at all. You may enjoy philosophy, religion or long conversations about purpose. A weak Eternity may feel lost when someone asks "What is it all for?"</ChipRow>

    <h3 class="sub">The four positions</h3>
    <ArrowRow>The theory uses Afanasyev's position model. In the theory, a position tells how much energy you give an aspect, not how good you are at it. The test measures only your priority order.</ArrowRow>
    <ChipRow label="1st:">You give this aspect the most energy, sometimes too much. You see everything through it, and other people notice it first. Example: a 1st Future turns a dinner conversation into a plan.</ChipRow>
    <ChipRow label="2nd:">You give this aspect a normal amount of energy. You use it as a tool when you need it, and then stop. It often supports your 1st aspect.</ChipRow>
    <ChipRow label="3rd:">This aspect is weak. You may deal with it badly or feel unsure about it, and you may think you should be better at it. Kind help from others in this area can mean a lot to you.</ChipRow>
    <ChipRow label="4th:">This aspect has the least weight for you. You give it little attention, and it does not worry you much. Other people may see a blind spot here before you do.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the four letters from left to right, from most energy to least energy.</ArrowRow>
    <ArrowRow>Example: <code>NVBP</code> is 1st Present, 2nd Eternity, 3rd Future and 4th Past. This person lives in the moment and asks what it means. Plans are harder for them, and they give little attention to the past.</ArrowRow>
    <ArrowRow>Look at your 1st and 4th letters first, because they are the largest contrast. The theory links the 3rd letter to feeling unsure; the test does not check this.</ArrowRow>
    <ArrowRow>Compare your order with the orders of people close to you. Two people with opposite orders often see the same event very differently.</ArrowRow>
    <ArrowRow>Some sources give each of the 24 types a nickname. For example, some guides call <code>NVBP</code> "the Politician". The nicknames are not the same in all sources.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>V is Eternity, not Volition.</strong> In Attitudinal Psyche, V is Volition. In Temporistics, V is Eternity. Both systems use Russian letters, so one letter can have two meanings.</ArrowRow>
    <ArrowRow><strong>N is Present, not Intuition.</strong> The letter comes from the Russian word for "present". It has no connection to the Jungian or MBTI N.</ArrowRow>
    <ArrowRow><strong>B is Future.</strong> It is not the first letter of an English word.</ArrowRow>
    <ArrowRow><strong>A 4th aspect is not a fault.</strong> It shows where you use less energy. Everyone has a 4th aspect.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .tp { display: grid; grid-template-columns: 8rem repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(3, auto); column-gap: var(--fx-4); }
  .col { display: grid; grid-row: span 3; grid-template-rows: subgrid; row-gap: var(--fx-2); }
  .keys > :first-child { align-self: end; }
  .big { font-size: 20px; margin-right: var(--fx-1); }
  .q { color: var(--text); }
  .linked { font-size: 12px; color: var(--meta); }
  .sub { margin: var(--fx-5) 0 var(--fx-3) !important; }
  .track { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: var(--fx-3); }
  .track li { display: grid; gap: var(--fx-1); padding-top: var(--fx-2); border-top: var(--w) solid var(--rust); }
  .track .lt { font-size: 16px; }
  @media (max-width: 760px) {
    .tp { grid-template-columns: 1fr 1fr; gap: var(--fx-4) var(--fx-3); }
    .keys { display: none; }
    .col { grid-row: auto; grid-template-rows: none; }
    .track { column-gap: var(--fx-2); }
    .track .fx-k { font-size: 10px; }
  }
</style>
