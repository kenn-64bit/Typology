<script lang="ts">
  // MOTIVES page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#motives";
  const COLS = [
    ["1", "M", "A", "A", "strong"], ["2", "O", "C", "|O|", "strongest"], ["3", "T", "H", "X", "middle"], ["4", "I", "W", "I", "strong"],
    ["5", "V", "D", "V", "strong"], ["6", "E", "R", "R", "strong"], ["7", "S", "G", "g", "medium"],
  ];
  /** True when the example letter in this column is this pole (1 = high, 2 = low). Strength marks and case are ignored. */
  const isOn = (c: string[], i: 1 | 2) => c[3]!.replace(/\|/g, "").toUpperCase() === c[i];
</script>

<TypologyLayout {t} {result} title="MOTIVES"
  facts={["7 traits", "one letter each"]}
  format="28 statements on one page"
  extra="This test is scored on its own answers. A Big Five result does not change it.">

  {#snippet overview()}
    <p>The Big Five describes how you behave. MOTIVES tries to describe why. It measures seven drives: status, new experience, order, care for others, energy, calm and loyalty to your own group.</p>
    <p>SimilarMinds, a personality test website, built MOTIVES from the Big Five. It keeps some Big Five ideas and adds others, such as Materialistic and Sectarian. Each of the seven traits has two ends, called poles.</p>
    <p>Two people can have the same Big Five code and different motives. Both may be organized. One keeps order to feel calm. The other keeps order to look successful. MOTIVES tries to measure that difference.</p>
    <p>No independent study has tested MOTIVES. Compare each letter with what you see in your own life, and keep the ones that fit.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ArrowRow>The code has seven letters in a fixed order: <strong>M O T I V E S</strong>. The name MOTIVES is the seven high-pole letters. Each position shows the high-pole letter or the low-pole letter.</ArrowRow>
    <ChipRow label="Uppercase:" href={g}><strong>Strong.</strong> Example: <code>A</code>. You lean clearly to this pole.</ChipRow>
    <ChipRow label="Lowercase:" href={g}><strong>Medium.</strong> Example: <code>g</code>. You lean to this pole, but your score is closer to the middle.</ChipRow>
    <ChipRow label="X:" href={g}><strong>Middle.</strong> You are between the two poles.</ChipRow>
    <ChipRow label="|bars|:" href={g}><strong>Strongest trait.</strong> Example: <code>|O|</code>. Of your seven traits, this one is clearly furthest from the middle. If two or more traits are about equally far, no letter gets bars.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">{COLS.map(c => c[3]).join("")}</code></p>
      <div class="mo" role="table" aria-label="The seven MOTIVES positions with an example">
        <div class="mo-row" role="row"><span class="fx-k" role="rowheader">Position</span>{#each COLS as c (c[0])}<span class="fx-k" role="cell">{c[0]}</span>{/each}</div>
        <div class="mo-row" role="row"><span class="fx-k" role="rowheader">High pole</span>{#each COLS as c (c[0])}<a class="lt" class:on={isOn(c, 1)} role="cell" href={g}>{c[1]}</a>{/each}</div>
        <div class="mo-row low" role="row"><span class="fx-k" role="rowheader">Low pole</span>{#each COLS as c (c[0])}<a class="lt" class:on={isOn(c, 2)} role="cell" href={g}>{c[2]}</a>{/each}</div>
        <div class="mo-row ex" role="row"><span class="fx-k" role="rowheader">Example</span>{#each COLS as c (c[0])}<span role="cell"><code>{c[3]}</code><small>{c[4]}</small></span>{/each}</div>
      </div>
      <p class="fx-cap">One letter per column; the marks around it show its strength.</p>
    </div>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">1. M / A: Materialistic or Ascetic</h3>
    <ArrowRow>This trait is about how much appearance, money and status drive you.</ArrowRow>
    <ChipRow label="M (Materialistic):" href={g}>You want a good appearance, status and a life that other people admire. You may care about brands, a good home or how others see your success. These wants can make you work hard and aim high.</ChipRow>
    <ChipRow label="A (Ascetic):" href={g}>Appearance, money and status matter less to you. You may wear the same clothes for years and not mind. A simple life feels normal to you, not like a loss. Competing for status can tire you.</ChipRow>

    <h3 class="sub">2. O / C: Offbeat or Conventional</h3>
    <ArrowRow>This trait is about how much you look for what is new and unusual.</ArrowRow>
    <ChipRow label="O (Offbeat):" href={g}>You like new things, experiments and unusual choices. You may order the dish you do not know, or choose a career that few people choose. The usual way can bore you.</ChipRow>
    <ChipRow label="C (Conventional):" href={g}>You prefer what you know. Change and experiments interest you less. You trust methods that have worked for many people. Clear roles and traditions feel comfortable to you.</ChipRow>

    <h3 class="sub">3. T / H: Thinking or Haphazard</h3>
    <ArrowRow>This trait is about planning and order in daily life.</ArrowRow>
    <ChipRow label="T (Thinking):" href={g}>You want a planned and orderly life. You think before you act, and you want to know the plan. A disorganized schedule can make you uneasy.</ChipRow>
    <ChipRow label="H (Haphazard):" href={g}>You follow plans less often, and your life is less organized. You may decide on the day. You adapt quickly, but without reminders you may forget tasks.</ChipRow>

    <h3 class="sub">4. I / W: Interpersonal or Withholding</h3>
    <ArrowRow>This trait is about how much you put other people first.</ArrowRow>
    <ChipRow label="I (Interpersonal):" href={g}>Helping and caring for others comes first for you. You may be the friend who remembers birthdays, or who calls when someone is sick. Other people's problems can feel like your own.</ChipRow>
    <ChipRow label="W (Withholding):" href={g}>Helping others and giving way to them come second for you. You keep your time and energy for your own goals. You help when someone asks, but you do not often offer.</ChipRow>

    <h3 class="sub">5. V / D: Vital or Depressed</h3>
    <ArrowRow>This trait is about your usual energy and what you expect from life.</ArrowRow>
    <ChipRow label="V (Vital):" href={g}>You feel positive, energetic and satisfied with life. You start the day with plans and expect them to work. A problem does not stop you for long.</ChipRow>
    <ChipRow label="D (Depressed):" href={g}>You feel pessimistic and low, and you can act against your own interests. You may expect things to go wrong. You may give up on a goal before you start it.</ChipRow>

    <h3 class="sub">6. E / R: Easygoing or Rigid</h3>
    <ArrowRow>This trait is about tension and how much you need calm.</ArrowRow>
    <ChipRow label="E (Easygoing):" href={g}>Calm and rest come first for you. Small problems do not upset you. You may enjoy slow days with no plan.</ChipRow>
    <ChipRow label="R (Rigid):" href={g}>You find it hard to relax, and you are often tense. You may think about work after work hours. Rules and routines can feel safer than free time.</ChipRow>

    <h3 class="sub">7. S / G: Sectarian or Globalistic</h3>
    <ArrowRow>This trait is about how many people you feel responsible for.</ArrowRow>
    <ChipRow label="S (Sectarian):" href={g}>Your own group, nation or culture comes first. Loyalty to your people is important to you. You may think that each group must look after its own members.</ChipRow>
    <ChipRow label="G (Globalistic):" href={g}>You want to include everyone and you care about the whole world. People far away can matter to you as much as your neighbors. Lines between groups matter less to you.</ChipRow>
    <ChipRow label="warning:">In MOTIVES, "Depressed" is the name of a trait. It is not a medical diagnosis. If you feel low on most days, talk to a doctor or a counselor.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the seven letters in M-O-T-I-V-E-S order. Each position is always the same trait.</ArrowRow>
    <ArrowRow>Uppercase letters are strong and lowercase letters are medium. Read the uppercase letters first, because they are your clearest motives.</ArrowRow>
    <ArrowRow><code>X</code> means you are in the middle for that position.</ArrowRow>
    <ArrowRow>The letter between bars, such as <code>|O|</code>, is your strongest trait. A code without bars means no single trait stood out.</ArrowRow>
    <ArrowRow>Example: <code>A|O|XIVRg</code> is Ascetic, Offbeat (strongest), middle on order, Interpersonal, Vital, Rigid and medium Globalistic. This person cares little about status, likes the unusual, helps others and has a lot of energy, but finds it hard to relax.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>MOTIVES E and R are not SLOAN E and R.</strong> In MOTIVES, E is Easygoing and R is Rigid. In SLOAN, E is Egocentric and R is Reserved.</ArrowRow>
    <ArrowRow><strong>MOTIVES T is not Jungian Thinking.</strong> In MOTIVES, T is a planned, orderly life. Jungian Thinking is a way of making decisions.</ArrowRow>
    <ArrowRow><strong>MOTIVES I is not Introversion.</strong> In MOTIVES, I is Interpersonal: care for other people.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .mo { display: grid; row-gap: var(--fx-2); }
  .mo-row { display: grid; grid-template-columns: 6rem repeat(7, minmax(0, 1fr)); align-items: baseline; justify-items: center; }
  .mo-row > :first-child { justify-self: start; }
  .mo .lt { font-size: var(--fs-lg); }
  .low { padding-top: var(--fx-2); border-top: 1px solid var(--fx-line); }
  .low .lt:not(.on) { color: var(--meta); font-weight: normal; }
  .ex { margin-top: var(--fx-3); }
  .ex span { display: grid; justify-items: center; gap: 2px; }
  .ex code { font: bold var(--fs-lg) var(--font-mono); color: var(--rust); }
  .ex small { font-size: var(--fs-sm); color: var(--meta); }
  @media (max-width: 760px) {
    .mo-row { grid-template-columns: 3.6rem repeat(7, minmax(0, 1fr)); }
    .mo-row > :first-child { font-size: var(--fs-xs); }
    .ex small { writing-mode: vertical-rl; transform: rotate(180deg); font-size: var(--fs-xs); }
  }
</style>
