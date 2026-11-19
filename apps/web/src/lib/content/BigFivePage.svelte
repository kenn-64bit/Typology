<script lang="ts">
  // Big Five / SLOAN page text: CONTENT.md §3. Do not reword.
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
  facts={["5 TRAITS", "5 LETTERS", "32 CODES"]}
  format={`${parseInt(t.questions)} statements · all on one page`}>

  {#snippet overview()}
    <p>The Big Five is the model most personality psychologists use today. It did not start from one person's theory. Psychologists collected thousands of words that people use to describe each other, such as "talkative", "moody" or "tidy". Then they checked which words go together. Again and again, the words fell into five large groups. These groups are the five traits.</p>
    <p>Each trait is a scale, like height. Most people are somewhere in the middle, and few people are at the far ends. So the Big Five does not put you in a box. It shows where you sit on five lines.</p>
    <p>SLOAN is a short way to write those five positions. It gives one letter per trait. Your code shows which side of the middle you lean to, and how strongly.</p>
    <p>Many other tests on this site use your Big Five result. So start here. It is the base for your whole bio.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code></ChipRow>
    <ArrowRow>The five letters always follow the same order: <strong>S L O A N</strong>. The name SLOAN is made from the five high letters.</ArrowRow>
    <ArrowRow>Each position has two possible letters. The high letter means a score above the middle. The low letter means a score below it:</ArrowRow>
    {#each POS as p (p.n)}
      <ChipRow label="{p.n}:" href={g}>{p.trait} · High letter: <strong>{p.hi[0]}</strong> {p.hi[1]} · Low letter: <strong>{p.lo[0]}</strong> {p.lo[1]}</ChipRow>
    {/each}
    <ArrowRow>Markers show how far your score is from the middle:</ArrowRow>
    <ChipRow label="/X/:" href={g}><strong>Strong.</strong> Your score is far from the middle. This letter is likely to stay the same when you retake the test.</ChipRow>
    <ChipRow label="X:" href={g}><strong>Clear.</strong> A plain letter means a clear lean to one side.</ChipRow>
    <ChipRow label="[X]:" href={g}><strong>Borderline.</strong> Your score is close to the middle. The other letter is almost as true for you.</ChipRow>
    <ChipRow label="X (letter):" href={g}><strong>Middle.</strong> The letter X itself means no lean. You show both sides about equally.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="bf" role="table" aria-label="The five SLOAN positions, from low to high">
      <div class="bf-row bf-head" role="row"><span></span><span role="columnheader">LOW</span><span class="bf-arrow" aria-hidden="true">Example: <code>{exampleFor(t.slug)}</code></span><span role="columnheader" class="r">HIGH</span></div>
      {#each POS as p, i (p.n)}
        <div class="bf-row" role="row">
          <span class="dg-label" role="rowheader">Position {p.n}</span>
          <span role="cell"><a class="dg-letter" href={g}>{p.lo[0]}</a> {p.lo[1]}</span>
          <span class="bf-line" aria-hidden="true"><span style="left: {MARKS[i] ?? 50}%"></span></span>
          <span role="cell" class="r">{p.hi[1]} <a class="dg-letter" href={g}>{p.hi[0]}</a></span>
        </div>
      {/each}
      <div class="bf-row" aria-hidden="true"><span></span><span></span><span class="bf-mid">middle = X</span><span></span></div>
    </div>
    <p class="dg-note">Each trait is a line, not a box. Most people score near the middle on most traits. Your letter shows which side of the middle you are on. The marker shows how far from the middle you are.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">S / R: Extraversion</h3>
    <ArrowRow>Extraversion is about where you get your energy, and how much you look for stimulation from the outside world.</ArrowRow>
    <ChipRow label="S (Social):" href={g}>You get energy from people and activity. You talk more and look for company. After a busy weekend with friends, you feel charged, not drained. You may think out loud and enjoy being the one who starts the talk.</ChipRow>
    <ChipRow label="R (Reserved):" href={g}>You get energy from quiet time. You prefer small groups or time alone. You can enjoy a party, but you may need a quiet evening after it. You often think before you speak. Reserved is not the same as shy. Shy means fear of judgment. Reserved means you need less outside stimulation.</ChipRow>

    <h3 class="sub">L / C: Neuroticism (emotional reactivity)</h3>
    <ArrowRow>This trait is about how strongly you react to stress, threat and loss. Everyone feels bad sometimes. The trait shows how fast and how strongly it happens.</ArrowRow>
    <ChipRow label="L (Limbic):" href={g}>You feel stress, worry and mood changes strongly. A small comment can stay with you all day. You may notice risks that other people miss. This sensitivity can help you prepare. It can also make rest harder. The name comes from the limbic system, the part of the brain linked to emotion.</ChipRow>
    <ChipRow label="C (Calm):" href={g}>You stay steady under stress. Bad events affect you for a shorter time. When plans fail, you tend to shrug and move on. Other people may lean on you in a crisis. A very calm person can sometimes miss a real warning sign.</ChipRow>

    <h3 class="sub">O / U: Conscientiousness</h3>
    <ArrowRow>Conscientiousness is about order, self-control and how you handle tasks and promises.</ArrowRow>
    <ChipRow label="O (Organized):" href={g}>You plan, keep order and finish tasks on time. You may use lists, calendars or a fixed routine. People trust you with deadlines. Too much order can make sudden change feel stressful.</ChipRow>
    <ChipRow label="U (Unstructured):" href={g}>You prefer to stay flexible. You plan less and act on the moment. You may work in bursts, close to the deadline. You adapt fast when plans change. You may need outside structure, such as reminders, for boring tasks.</ChipRow>

    <h3 class="sub">A / E: Agreeableness</h3>
    <ArrowRow>Agreeableness is about how you treat other people's needs compared to your own.</ArrowRow>
    <ChipRow label="A (Accommodating):" href={g}>You cooperate, trust others and avoid conflict. You notice when someone feels left out. You often give way to keep the peace. A very accommodating person can find it hard to say no.</ChipRow>
    <ChipRow label="E (Egocentric):" href={g}>You are direct and competitive. You question other people's motives. You say what you think, even when it is not welcome. You defend your own interests. "Egocentric" here does not mean selfish or cruel. It means you put less weight on keeping others happy.</ChipRow>

    <h3 class="sub">I / N: Openness</h3>
    <ArrowRow>Openness is about how much you look for new ideas, art, feelings and experiences.</ArrowRow>
    <ChipRow label="I (Inquisitive):" href={g}>You like new ideas, art and unusual experiences. You may read about many unrelated topics, try strange food or enjoy abstract talks. Routine can bore you.</ChipRow>
    <ChipRow label="N (Non-curious):" href={g}>You prefer the practical and the familiar. You like what works and see little reason to change it. You may prefer clear facts to abstract theory. Non-curious does not mean less intelligent. It means you value the known over the new.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the five letters from left to right in S-L-O-A-N order. Each position is always the same trait.</ArrowRow>
    <ArrowRow>Check the markers. <code>/R/</code> is strong. <code>[I]</code> is borderline. <code>X</code> is the middle. A strong letter is a stable part of you. A borderline letter can change from day to day or from test to test.</ArrowRow>
    <ArrowRow>Look at the percentile next to each letter. It shows your score compared to other people. Example: 80% Reserved means you are more reserved than about 80 of 100 people.</ArrowRow>
    <ArrowRow>Example: <code>/R/LOA[I]</code> = strongly Reserved, Limbic, Organized, Accommodating, borderline Inquisitive. This person likes quiet, feels things strongly, keeps order and avoids conflict. New ideas attract them only a little.</ArrowRow>
    <ArrowRow>No letter is better than the other. Each side has strengths and costs in different situations.</ArrowRow>
    <ChipRow label="NOTE:">"Limbic" and "Egocentric" are the SLOAN names for one end of a trait. They are not insults or diagnoses.</ChipRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>SLOAN is not a separate theory.</strong> It is a way to write Big Five scores as letters. The studies are about the scores, not the letters.</ArrowRow>
    <ArrowRow><strong>Position 4 "E" is not Extraversion.</strong> In SLOAN, E means Egocentric (low Agreeableness). Extraversion is position 1 (S or R).</ArrowRow>
    <ArrowRow><strong>Position 5 "N" is not Neuroticism.</strong> In SLOAN, N means Non-curious (low Openness). Neuroticism is position 2 (L or C).</ArrowRow>
    <ArrowRow><strong>Your letters are not fixed for life.</strong> Traits change slowly over the years. Many people become calmer, more organized and more accommodating as they age.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .bf { display: grid; gap: 0.35rem; font: 12.5px/1.4 var(--font-body); }
  .bf-row { display: grid; grid-template-columns: 6.5rem 9.5rem minmax(4rem, 1fr) 9.5rem; gap: 0.6rem; align-items: center; }
  .bf-head { font: bold 10px var(--font-head); letter-spacing: 0.08em; color: var(--rust); }
  .bf-arrow { text-align: center; color: var(--meta); letter-spacing: 0; }
  .bf-arrow code { color: var(--rust); font-size: 12px; }
  .r { text-align: right; }
  .bf-line::after { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--meta); opacity: 0.5; }
  .bf-line { position: relative; height: 10px; background: linear-gradient(90deg, var(--cream-dark), var(--tan), var(--cream-dark)); }
  .bf-line span { position: absolute; z-index: 1; top: -3px; width: 4px; height: 16px; margin-left: -2px; background: var(--rust); }
  .bf-mid { position: relative; text-align: center; font-size: 10px; color: var(--meta); line-height: 1.2; padding-top: 6px; }
  .bf-mid::before { content: ""; position: absolute; left: 50%; top: 0; height: 5px; border-left: 1px solid var(--meta); }
  @media (max-width: 760px) {
    .bf-row { grid-template-columns: 1fr 1fr; }
    .bf-row > :first-child { grid-column: 1 / -1; }
    .bf-line, .bf-arrow, .bf-mid { grid-column: 1 / -1; }
  }
</style>
