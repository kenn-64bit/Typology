<script lang="ts">
  // Jungian Functions page text: CONTENT.md §6. Do not reword.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#jung";
  const GRID = [
    { fn: "THINKING", l: "T", kind: "(judging)", i: ["Ti", "inner logic, checks if ideas are consistent"], e: ["Te", "organizes facts and systems to get results"] },
    { fn: "FEELING", l: "F", kind: "(judging)", i: ["Fi", "personal values, \"is this true to me?\""], e: ["Fe", "group feelings, keeps harmony with others"] },
    { fn: "SENSATION", l: "S", kind: "(perceiving)", i: ["Si", "compares now with past experience and memory"], e: ["Se", "takes in the present moment and acts on it"] },
    { fn: "INTUITION", l: "N", kind: "(perceiving)", i: ["Ni", "sees one inner pattern and where it leads"], e: ["Ne", "sees many possibilities and links outside"] },
  ];
</script>

<TypologyLayout {t} {result} title="Jungian Functions"
  facts={["8 FUNCTIONS", "2 ATTITUDES"]}
  format="About 12–28 statements and sliders · all on one page"
  extra="Some questions are sliders between two statements. Move the slider toward the statement that fits you better.">

  {#snippet overview()}
    <p>The Swiss psychiatrist Carl Jung noticed that people do two basic things all day. They take in information, and they make decisions about it. He saw that people do both in different ways.</p>
    <p>For taking in information, some people trust concrete facts (Sensation). Others trust patterns and hunches (Intuition). For decisions, some people use logic (Thinking). Others use values and the effect on people (Feeling). Each of these four can point inward, to your inner world, or outward, to the world around you. Four functions times two directions gives eight function-attitudes.</p>
    <p>Everyone uses all eight. But most people trust one or two more than the others, like a favorite hand. Your result shows the two you lean on most: your main function and your helper.</p>
    <p>Many later systems grew from this idea, including MBTI and Socionics. This page uses Jung's original eight functions. The app also shows MBTI-style letters for comparison.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ChipRow label="IT(N):" href={g}><strong>Jungian code:</strong> attitude + main function + (helper function). Example: I = introverted, T = Thinking is the main function, (N) = Intuition helps it.</ChipRow>
    <ChipRow label="(TiNi):" href={g}><strong>Function shorthand:</strong> main function + helper function, each with its attitude. It gives the same information as the code, but shows the direction of the helper too.</ChipRow>
    <ChipRow label="i:" href={g}><strong>Introverted (inner world).</strong> The function works on your own thoughts, values, memories or images. It looks inward first.</ChipRow>
    <ChipRow label="e:" href={g}><strong>Extraverted (outer world).</strong> The function works on people, objects and events around you. It looks outward first.</ChipRow>
    <ChipRow label="T, F:" href={g}><strong>Judging functions.</strong> Thinking and Feeling. They decide and judge.</ChipRow>
    <ChipRow label="S, N:" href={g}><strong>Perceiving functions.</strong> Sensation and Intuition. They take in information.</ChipRow>
    <ArrowRow>The app also shows MBTI-style letters with a percentage for each letter.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="dg-scroll">
      <div class="jg" role="table" aria-label="The eight Jungian functions">
        <span class="dg-label" role="columnheader">Attitude</span>
        <span class="dg-label" role="columnheader">introverted (i)<br /><small>inner world</small></span>
        <span class="dg-label" role="columnheader">extraverted (e)<br /><small>outer world</small></span>
        {#each GRID as r (r.l)}
          <span class="dg-label fn" role="rowheader">{r.fn} <a class="dg-letter" href={g}>{r.l}</a><br /><small>{r.kind}</small></span>
          <span class="cell" class:ex={r.i[0] === "Ti" || r.i[0] === "Ni"} role="cell"><a class="dg-letter" href={g}>{r.i[0]}</a> {r.i[1]}</span>
          <span class="cell" role="cell"><a class="dg-letter" href={g}>{r.e[0]}</a> {r.e[1]}</span>
        {/each}
      </div>
    </div>
    <h3 class="sub">How a code is built:</h3>
    <div class="build">
      <div class="code"><code>I</code><code>T</code><code>(N)</code></div>
      <ul>
        <li><code>I</code> = attitude of the main function (introverted)</li>
        <li><code>T</code> = main function (Thinking)</li>
        <li><code>N</code> = helper function (Intuition)</li>
        <li>Shorthand: <code>(Ti Ni)</code> → Ti = main, Ni = helper</li>
      </ul>
    </div>
    <p class="dg-note">Each row is one of the four functions. Each column is one direction. Each box is one of the eight function-attitudes. Your result picks the two boxes you use most.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">Thinking: decides by logic</h3>
    <ChipRow label="Ti:" href={g}><strong>Introverted Thinking</strong><br />You build your own logical framework. You check if ideas fit together before you accept them. You may take a gadget apart to see how it works. You ask "Does this make sense?" more than "Does this work?" Rules from outside mean little to you until you understand them.</ChipRow>
    <ChipRow label="Te:" href={g}><strong>Extraverted Thinking</strong><br />You organize people, facts and tasks to get results. You use clear rules and measures. You like lists, deadlines and goals you can count. In a group project, you may be the one who sets the plan and checks progress.</ChipRow>
    <h3 class="sub">Feeling: decides by values</h3>
    <ChipRow label="Fi:" href={g}><strong>Introverted Feeling</strong><br />You judge by your own values. You ask, "Is this true to who I am?" You may refuse a good job if it goes against your values. Your feelings run deep, but you may not show them. Being authentic matters more to you than fitting in.</ChipRow>
    <ChipRow label="Fe:" href={g}><strong>Extraverted Feeling</strong><br />You notice the mood of a group. You act to keep harmony and shared values. You often know how others feel before they say it. You may adjust what you say so nobody gets hurt. Good manners and group spirit matter to you.</ChipRow>
    <h3 class="sub">Sensation: takes in concrete facts</h3>
    <ChipRow label="Si:" href={g}><strong>Introverted Sensation</strong><br />You compare the present with past experience. You trust what worked before. You may remember small details from years ago, like a smell or a place. You like routines that feel comfortable and safe.</ChipRow>
    <ChipRow label="Se:" href={g}><strong>Extraverted Sensation</strong><br />You notice the physical present in detail. You act on what is in front of you now. You may enjoy sports, food, music or anything you can touch and feel. You react fast and enjoy real experience more than theory.</ChipRow>
    <h3 class="sub">Intuition: takes in patterns</h3>
    <ChipRow label="Ni:" href={g}><strong>Introverted Intuition</strong><br />You see one pattern behind events. You often know where things lead before you can explain why. Ideas may come to you as sudden insights. You may focus on one long-term vision and ignore distractions.</ChipRow>
    <ChipRow label="Ne:" href={g}><strong>Extraverted Intuition</strong><br />You see many possibilities and links between ideas. You like to explore options. One idea leads you to ten more. You may jump between topics in a talk and enjoy brainstorming more than finishing.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>The first letter is the attitude of your main function: I or E. It shows whether your strongest function looks inward or outward.</ArrowRow>
    <ArrowRow>The second letter is your main function: T, F, S or N. This is the function you trust most and use first.</ArrowRow>
    <ArrowRow>The letter in parentheses is your helper function. It supports the main function. If your main function judges, the helper usually perceives, and the reverse.</ArrowRow>
    <ArrowRow>The shorthand in parentheses gives both functions with their attitudes.</ArrowRow>
    <ArrowRow>Example: <code>IT(N) (TiNi)</code> = Introverted Thinking is the main function, and Introverted Intuition helps it. This person builds inner logic and checks it against a long-term inner pattern.</ArrowRow>
    <ArrowRow>The bar chart shows your score for all eight functions. Low scores do not mean you cannot use a function. They mean you use it less often or with less trust.</ArrowRow>
    <ChipRow label="NOTE:">MBTI rules say the main and helper functions must have opposite attitudes, for example Ti with Ne. Jung did not set this rule. So this app can show a result such as <code>(TiNi)</code>. In that case, the app shows the closest MBTI types separately.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>Jungian functions are not the MBTI letters.</strong> MBTI has four letter pairs. Jung described eight functions. The two systems overlap, but they are not the same.</ArrowRow>
    <ArrowRow><strong>Introverted does not mean shy.</strong> Here it means the function works on the inner world. An outgoing person can still have an introverted main function.</ArrowRow>
    <ArrowRow><strong>Thinking does not mean intelligent.</strong> Feeling does not mean emotional. They are two ways to make decisions. Both can be careful and wise.</ArrowRow>
    <ArrowRow><strong>Sensation does not mean sensual.</strong> It means you trust concrete facts that you can see, hear or touch.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .jg { display: grid; grid-template-columns: 9rem minmax(0, 1fr) minmax(0, 1fr); gap: 4px; min-width: 32rem; font: 12.5px/1.45 var(--font-body); }
  .jg small { font-weight: normal; text-transform: none; color: var(--meta); letter-spacing: 0; }
  .fn { align-self: center; }
  .cell { padding: 0.5rem 0.6rem; background: var(--white); border: 1px solid var(--panel-border); }
  .cell.ex { border-color: var(--tan); box-shadow: inset 0 0 0 1px var(--tan); background: #fffaf4; }
  .build { display: flex; flex-wrap: wrap; gap: 1.2rem; align-items: center; font: 12.5px/1.6 var(--font-body); }
  .code { display: flex; gap: 0.3rem; }
  .code code { font: bold 1.6rem var(--font-mono); padding: 0.1rem 0.4rem; border-bottom: 3px solid var(--tan); }
  .build ul { margin: 0; padding-left: 1.1rem; }
</style>
