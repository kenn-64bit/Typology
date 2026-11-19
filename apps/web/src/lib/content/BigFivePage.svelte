<script lang="ts">
  // Big Five / SLOAN page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#sloan";
  const POS = [
    { n: "1", trait: "Extraversion", hi: ["S", "Social"], lo: ["R", "Reserved"] },
    { n: "2", trait: "Neuroticism", hi: ["L", "Limbic"], lo: ["C", "Calm"] },
    { n: "3", trait: "Conscientiousness", hi: ["O", "Organized"], lo: ["U", "Unstructured"] },
    { n: "4", trait: "Agreeableness", hi: ["A", "Accommodating"], lo: ["E", "Egocentric"] },
    { n: "5", trait: "Openness", hi: ["I", "Inquisitive"], lo: ["N", "Non-curious"] },
  ];
  // Marker positions (% from the low end) read from the page's random example code.
  const STEP = { strong: 40, clear: 22, border: 7 } as const;
  const MARKS = [...exampleFor("bigfive").matchAll(/\/(.)\/|\[(.)\]|([A-Z])/g)].slice(0, 5).map((m, i) => {
    const l = m[1] ?? m[2] ?? m[3]!;
    if (l === "X") return 50;
    const d = m[1] ? STEP.strong : m[2] ? STEP.border : STEP.clear;
    return 50 + (l === POS[i]!.hi[0] ? d : -d);
  });
</script>

<TypologyLayout {t} {result} title="Big Five / SLOAN"
  facts={["5 traits", "one letter each", "32 letter codes"]}
  format={`${parseInt(t.questions)} statements on one page`}>

  {#snippet overview()}
    <p>The Big Five is the model that most personality psychologists use today. It did not come from one person's theory. Researchers collected thousands of words that people use to describe each other, such as "talkative", "moody" and "tidy". Then they measured which words people apply together. In study after study, the words formed five groups. These groups are the five traits.</p>
    <p>Each trait is a scale, like height. Most people score near the middle, and few score at the ends. So the Big Five does not sort you into a type. It gives your position on five scales.</p>
    <p>SLOAN is a short way to write those five positions, with one letter per trait. The letter shows which side of the middle you are on. Marks around the letter show how far from the middle you are.</p>
    <p>The MOTIVES, Four Temperaments and Jungian tests use your Big Five scores. Take this test first.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code></ChipRow>
    <ArrowRow>The five letters are always in the same order: <strong>S L O A N</strong>. The name SLOAN is the five high letters.</ArrowRow>
    <ArrowRow>Each position has two letters. The high letter is for a score above the middle. The low letter is for a score below it:</ArrowRow>
    {#each POS as p (p.n)}
      <ChipRow label="{p.n}:" href={g}>{p.trait} · High letter: <strong>{p.hi[0]}</strong> {p.hi[1]} · Low letter: <strong>{p.lo[0]}</strong> {p.lo[1]}</ChipRow>
    {/each}
    <ArrowRow>Marks show how far your score is from the middle:</ArrowRow>
    <ChipRow label="/X/:" href={g}><strong>Strong.</strong> Your score is far from the middle (at or beyond the 85th or 15th model percentile).</ChipRow>
    <ChipRow label="X:" href={g}><strong>Clear.</strong> A plain letter shows a clear lean to one side.</ChipRow>
    <ChipRow label="[X]:" href={g}><strong>Borderline.</strong> Your score is close to the middle. The other letter fits you almost as well.</ChipRow>
    <ChipRow label="X (letter):" href={g}><strong>Middle.</strong> The letter X means no lean. You show both sides about equally.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">{exampleFor(t.slug)}</code></p>
      <div class="bf" role="table" aria-label="The five SLOAN positions, from low to high">
        <div class="bf-row bf-head" role="row"><span></span><span class="fx-k r" role="columnheader">low</span><span></span><span class="fx-k" role="columnheader">high</span></div>
        {#each POS as p, i (p.n)}
          {@const m = MARKS[i] ?? 50}
          <div class="bf-row" role="row">
            <span class="fx-k" role="rowheader">Position {p.n}</span>
            <span class="r" role="cell">{p.lo[1]} <a class="lt" class:on={m < 50} href={g}>{p.lo[0]}</a></span>
            <span class="bf-line" aria-hidden="true"><span style="left: {m}%"></span></span>
            <span role="cell"><a class="lt" class:on={m > 50} href={g}>{p.hi[0]}</a> {p.hi[1]}</span>
          </div>
        {/each}
        <div class="bf-row" aria-hidden="true"><span></span><span></span><span class="bf-mid fx-k">middle = X</span><span></span></div>
      </div>
      <p class="fx-cap">The letter shows your side of the middle; the dot shows how far.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">S / R: Extraversion</h3>
    <ArrowRow>Extraversion is about where your energy comes from and how much outside activity you want.</ArrowRow>
    <ChipRow label="S (Social):" href={g}>People and activity give you energy. You talk more and look for company. After a busy weekend with friends, you feel rested, not tired. You may think out loud and often start conversations.</ChipRow>
    <ChipRow label="R (Reserved):" href={g}>Quiet time gives you energy. You prefer small groups or time alone. You can enjoy a party, but you may need a quiet evening after it. You often think before you speak. Reserved is not the same as shy. Shy people fear judgment. Reserved people need less outside activity.</ChipRow>

    <h3 class="sub">L / C: Neuroticism (emotional reactivity)</h3>
    <ArrowRow>This trait is about how strongly you react to stress, threat and loss. Everyone feels bad sometimes. The trait measures how fast and how strongly it happens to you.</ArrowRow>
    <ChipRow label="L (Limbic):" href={g}>You feel stress, worry and changes of mood strongly. A small comment can stay with you all day. You may see risks that other people miss. This helps you prepare, but it can make rest difficult. The name comes from the limbic system, the part of the brain linked to emotion.</ChipRow>
    <ChipRow label="C (Calm):" href={g}>You stay steady under stress, and bad events affect you for a shorter time. When a plan fails, you usually accept it and continue. Other people may depend on you in a crisis. A very calm person can miss a real warning sign.</ChipRow>

    <h3 class="sub">O / U: Conscientiousness</h3>
    <ArrowRow>Conscientiousness is about order, self-control and how you deal with tasks and promises.</ArrowRow>
    <ChipRow label="O (Organized):" href={g}>You plan, keep things in order and finish tasks on time. You may use lists, a calendar or a fixed routine. People trust you with deadlines. A sudden change of plan can cause you stress.</ChipRow>
    <ChipRow label="U (Unstructured):" href={g}>You prefer to stay flexible. You plan less and decide in the moment. You may work in bursts, close to the deadline. You adapt quickly when plans change. For boring tasks, reminders or other outside structure may help you.</ChipRow>

    <h3 class="sub">A / E: Agreeableness</h3>
    <ArrowRow>Agreeableness is about how much weight you give other people's needs compared with your own.</ArrowRow>
    <ChipRow label="A (Accommodating):" href={g}>You cooperate, trust others and avoid conflict. You see when someone feels left out. You often give way to keep the peace. A very accommodating person can find it hard to say no.</ChipRow>
    <ChipRow label="E (Egocentric):" href={g}>You are direct and competitive. You question other people's motives. You say what you think, even when people do not want to hear it, and you defend your own interests. Here, "Egocentric" does not mean selfish or cruel. It means you give less weight to keeping others happy.</ChipRow>

    <h3 class="sub">I / N: Openness</h3>
    <ArrowRow>Openness is about how much you look for new ideas, art, feelings and experiences.</ArrowRow>
    <ChipRow label="I (Inquisitive):" href={g}>You like new ideas, art and unusual experiences. You may read about many unrelated subjects, try unfamiliar food or enjoy abstract discussion. Routine can bore you.</ChipRow>
    <ChipRow label="N (Non-curious):" href={g}>You prefer the practical and the familiar. If something works, you see little reason to change it. You may prefer clear facts to abstract theory. Non-curious does not mean less intelligent. It means you prefer the known to the new.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the five letters from left to right in S-L-O-A-N order. Each position is always the same trait.</ArrowRow>
    <ArrowRow>Look at the marks. <code>/R/</code> is strong, <code>[I]</code> is borderline and <code>X</code> is the middle. The marks show how far the score is from the middle. How often a letter stays the same on a retake has not been measured for this test.</ArrowRow>
    <ArrowRow>Look at the percentile next to each trait. It compares your score with the test's built-in average, not with a measured group of people. Example: the 80th model percentile on Extraversion means a score above 80% of the test's built-in reference curve.</ArrowRow>
    <ArrowRow>Example: <code>/R/LOA[I]</code> is strongly Reserved, Limbic, Organized, Accommodating and borderline Inquisitive. This person likes quiet, feels things strongly, keeps order and avoids conflict. New ideas interest them a little more than average.</ArrowRow>
    <ArrowRow>Neither letter is better. Each side helps in some situations and costs you in others.</ArrowRow>
    <ChipRow label="note:">"Limbic" and "Egocentric" are SLOAN names for one end of a trait. They are not insults and they are not diagnoses.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>SLOAN is not a separate theory.</strong> It writes Big Five scores as letters. The research is about the scores, not the letters.</ArrowRow>
    <ArrowRow><strong>Position 4 "E" is not Extraversion.</strong> In SLOAN, E means Egocentric (low Agreeableness). Extraversion is position 1 (S or R).</ArrowRow>
    <ArrowRow><strong>Position 5 "N" is not Neuroticism.</strong> In SLOAN, N means Non-curious (low Openness). Neuroticism is position 2 (L or C).</ArrowRow>
    <ArrowRow><strong>Your letters can change over your life.</strong> Traits change slowly. Many people become calmer, more organized and more accommodating as they get older.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .bf { display: grid; row-gap: var(--fx-3); }
  .bf-row { display: grid; grid-template-columns: 6.5rem 10rem minmax(6rem, 1fr) 10rem; column-gap: var(--fx-3); align-items: center; }
  .bf-head { margin-bottom: calc(-1 * var(--fx-2)); }
  .r { text-align: right; }
  .bf .lt { font-size: var(--fs-lg); }
  .bf-line { position: relative; height: 1px; background: var(--fx-line); }
  .bf-line::before { content: ""; position: absolute; left: 50%; top: -4px; width: 1px; height: 9px; background: var(--tan); }
  .bf-line span { position: absolute; top: -4.5px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--rust); }
  .bf-mid { text-align: center; margin-top: calc(-1 * var(--fx-2)); }
  @media (max-width: 760px) {
    .bf { row-gap: var(--fx-4); }
    .bf-head { display: none; }
    .bf-row { grid-template-columns: 1fr 1fr; row-gap: var(--fx-2); }
    .bf-row > :first-child, .bf-mid { grid-column: 1 / -1; }
    .bf-row .r { text-align: left; }
    .bf-row > :last-child { text-align: right; }
    .bf-line { grid-column: 1 / -1; grid-row: 3; }
  }
</style>
