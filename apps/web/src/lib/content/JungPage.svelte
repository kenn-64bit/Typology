<script lang="ts">
  // Jungian Functions page.
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
    { fn: "thinking", l: "T", kind: "(judging)", i: ["Ti", "inner logic, checks if ideas are consistent"], e: ["Te", "organizes facts and systems to get results"] },
    { fn: "feeling", l: "F", kind: "(judging)", i: ["Fi", "personal values, \"is this true to me?\""], e: ["Fe", "group feelings, keeps harmony with others"] },
    { fn: "sensation", l: "S", kind: "(perceiving)", i: ["Si", "compares now with past experience and memory"], e: ["Se", "takes in the present moment and acts on it"] },
    { fn: "intuition", l: "N", kind: "(perceiving)", i: ["Ni", "sees one inner pattern and where it leads"], e: ["Ne", "sees many possibilities and links outside"] },
  ];
</script>

<TypologyLayout {t} {result} title="Jungian Functions"
  facts={["4 functions", "2 attitudes", "8 function-attitudes"]}
  format="12 to 28 statements on one page"
  extra="If you took the Big Five test, your Extraversion score gives the I/E scale a starting point.">

  {#snippet overview()}
    <p>The Swiss psychiatrist Carl Jung saw that people do two basic things all day. They take in information, and they make decisions about it. Different people do each of these in different ways.</p>
    <p>To take in information, some people trust concrete facts (Sensation) and others trust patterns and hunches (Intuition). To decide, some people use logic (Thinking) and others use values and the effect on people (Feeling). Each of these four functions can point inward, to your thoughts and memories, or outward, to the world around you. Four functions in two directions give eight function-attitudes.</p>
    <p>Everyone uses all eight. But most people trust one or two more than the others, as most people prefer one hand. Your result names the two you use most: your main function and your helper.</p>
    <p>MBTI and Socionics both came from this idea. This page uses Jung's original eight functions. The result also gives MBTI-style letters for comparison.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ChipRow label="IT(N):" href={g}><strong>Jungian code:</strong> attitude, main function, then the helper function in parentheses. In the example, I is introverted, T (Thinking) is the main function and N (Intuition) is the helper.</ChipRow>
    <ChipRow label="(TiNi):" href={g}><strong>Function shorthand:</strong> the main function and the helper, each with its attitude. It also gives the direction of the helper, which the code does not.</ChipRow>
    <ChipRow label="i:" href={g}><strong>Introverted (inner world).</strong> The function works first on your own thoughts, values, memories or images.</ChipRow>
    <ChipRow label="e:" href={g}><strong>Extraverted (outer world).</strong> The function works first on the people, objects and events around you.</ChipRow>
    <ChipRow label="T, F:" href={g}><strong>Judging functions.</strong> Thinking and Feeling make decisions.</ChipRow>
    <ChipRow label="S, N:" href={g}><strong>Perceiving functions.</strong> Sensation and Intuition take in information.</ChipRow>
    <ArrowRow>The result also gives four MBTI-style letters, each with a percentage.</ArrowRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">IT(N)</code><code class="lt on">(Ti Ni)</code></p>
      <div class="jg" role="table" aria-label="The eight Jungian functions">
        <span class="fx-k" role="columnheader">Attitude</span>
        <span class="fx-k" role="columnheader">introverted (i)<small>inner world</small></span>
        <span class="fx-k" role="columnheader">extraverted (e)<small>outer world</small></span>
        {#each GRID as r (r.l)}
          <span class="fn" role="rowheader"><span class="fx-k">{r.fn}</span> <a class="lt" href={g}>{r.l}</a><small>{r.kind}</small></span>
          <span class="cell" role="cell"><a class="lt fa" class:on={r.i[0] === "Ti" || r.i[0] === "Ni"} href={g}>{r.i[0]}</a><span>{r.i[1]}</span></span>
          <span class="cell" role="cell"><a class="lt fa" href={g}>{r.e[0]}</a><span>{r.e[1]}</span></span>
        {/each}
      </div>
      <h3 class="fx-k sub">How a code is built</h3>
      <dl class="parts">
        <dt><code>I</code></dt><dd>attitude of the main function (introverted)</dd>
        <dt><code>T</code></dt><dd>main function (Thinking)</dd>
        <dt><code>N</code></dt><dd>helper function (Intuition)</dd>
        <dt><code>(Ti Ni)</code></dt><dd>shorthand. Ti is the main function, Ni is the helper.</dd>
      </dl>
      <p class="fx-cap">Each function × direction is one function-attitude; your result is the two you use most.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">Thinking: decides by logic</h3>
    <ChipRow label="Ti:" href={g}><strong>Introverted Thinking</strong><br />You build your own system of logic. Before you accept an idea, you check that it fits with the rest. You may take a machine apart to see how it works. You ask "Does this make sense?" more often than "Does this work?" A rule from outside means little to you until you understand it.</ChipRow>
    <ChipRow label="Te:" href={g}><strong>Extraverted Thinking</strong><br />You organize people, facts and tasks to get results. You use clear rules and measurements. You like lists, deadlines and goals that you can count. In a group project, you may make the plan and check progress.</ChipRow>
    <h3 class="sub">Feeling: decides by values</h3>
    <ChipRow label="Fi:" href={g}><strong>Introverted Feeling</strong><br />You judge by your own values. You ask, "Does this agree with who I am?" You may refuse a good job if it goes against your values. Your feelings are strong, but you may not show them. Being true to yourself matters more to you than fitting in.</ChipRow>
    <ChipRow label="Fe:" href={g}><strong>Extraverted Feeling</strong><br />You feel the mood of a group, and you act to keep the peace and the values that the group shares. You often know how people feel before they say it. You may change what you say so that nobody is hurt. Good manners and a united group matter to you.</ChipRow>
    <h3 class="sub">Sensation: takes in concrete facts</h3>
    <ChipRow label="Si:" href={g}><strong>Introverted Sensation</strong><br />You compare what happens now with what happened before, and you trust what worked in the past. You may remember small details from years ago, such as a smell or a place. Familiar routines feel comfortable and safe to you.</ChipRow>
    <ChipRow label="Se:" href={g}><strong>Extraverted Sensation</strong><br />You see the physical world around you in detail, and you act on what is in front of you now. You may enjoy sport, food, music or anything you can touch. You react quickly, and you prefer real experience to theory.</ChipRow>
    <h3 class="sub">Intuition: takes in patterns</h3>
    <ChipRow label="Ni:" href={g}><strong>Introverted Intuition</strong><br />You see one pattern behind events. You often know where something will go before you can say why. Ideas can come to you suddenly and complete. You may keep your attention on one long-term aim and ignore the rest.</ChipRow>
    <ChipRow label="Ne:" href={g}><strong>Extraverted Intuition</strong><br />You see many possibilities and connections between ideas, and you like to examine options. One idea gives you ten more. In conversation you may change subject often. You may enjoy starting ideas more than finishing them.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>The first letter is the attitude of your main function, I or E. It tells you if your strongest function points inward or outward.</ArrowRow>
    <ArrowRow>The second letter is your main function: T, F, S or N. You trust this function most and use it first.</ArrowRow>
    <ArrowRow>The letter in parentheses is your helper function. If your main function judges (T or F), the helper usually perceives (S or N). The opposite is also true.</ArrowRow>
    <ArrowRow>The shorthand gives both functions with their attitudes.</ArrowRow>
    <ArrowRow>Example: <code>IT(N) (TiNi)</code> means Introverted Thinking is the main function and Introverted Intuition is the helper. This person builds an inner system of logic and compares it with a long-term inner pattern.</ArrowRow>
    <ArrowRow>The bars give your score for all eight functions. A low score does not mean you cannot use a function. It means you use it less often, or trust it less.</ArrowRow>
    <ChipRow label="note:">MBTI says the main and helper functions must have opposite attitudes, for example Ti with Ne. Jung did not make this rule, so your result can be a code such as <code>(TiNi)</code>. The result then also gives the nearest MBTI type and its usual function order.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>Jungian functions are not the MBTI letters.</strong> MBTI has four pairs of letters. Jung described eight functions. The two systems overlap, but they are different.</ArrowRow>
    <ArrowRow><strong>Introverted does not mean shy.</strong> Here it means the function works on the inner world. An outgoing person can have an introverted main function.</ArrowRow>
    <ArrowRow><strong>Thinking does not mean intelligent, and Feeling does not mean emotional.</strong> They are two ways of making decisions. Each can be careful and sensible.</ArrowRow>
    <ArrowRow><strong>Sensation does not mean sensual.</strong> It means you trust concrete facts that you can see, hear or touch.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .jg { display: grid; grid-template-columns: 9rem minmax(0, 1fr) minmax(0, 1fr); column-gap: var(--fx-4); }
  .jg > * { padding: var(--fx-3) 0; border-top: 1px solid var(--fx-line); }
  .jg > :nth-child(-n + 3) { border-top: 0; padding-top: 0; }
  .jg small { display: block; font: 11px/1.4 var(--font-body); letter-spacing: 0; text-transform: none; color: var(--meta); }
  .cell { display: grid; grid-template-columns: 2.4rem minmax(0, 1fr); gap: var(--fx-2); align-items: baseline; }
  .fa { font-size: 15px; }
  .sub { margin-top: var(--fx-5) !important; margin-bottom: var(--fx-3) !important; }
  .parts { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: var(--fx-2) var(--fx-3); align-items: baseline; }
  .parts code { font: bold 13px var(--font-mono); color: var(--rust); }
  @media (max-width: 760px) {
    .jg { grid-template-columns: 1fr 1fr; column-gap: var(--fx-3); }
    .jg > :first-child { display: none; }
    .fn { grid-column: 1 / -1; padding-bottom: 0; }
    .cell { border-top: 0; grid-template-columns: 1fr; gap: 2px; padding-top: var(--fx-2); }
  }
</style>
