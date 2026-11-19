<script lang="ts">
  // MOTIVES page text: CONTENT.md §4. Do not reword.
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
</script>

<TypologyLayout {t} {result} title="MOTIVES"
  facts={["7 TRAITS", "7 LETTERS"]}
  format="About 10–21 statements · all on one page"
  extra="If you took Big Five first, this test needs fewer questions.">

  {#snippet overview()}
    <p>The Big Five describes how you behave. MOTIVES tries to describe why. It asks what pulls you forward and what holds you back. Examples are status, new experiences, order, care for others, energy, calm and group loyalty.</p>
    <p>SimilarMinds, a personality test website, built MOTIVES as a change to the Big Five. It keeps some Big Five ideas and adds new ones, such as Materialistic and Sectarian. The result is seven traits. Each trait has two ends, called poles.</p>
    <p>Two people can have the same Big Five code and different motives. Both may be organized. One keeps order to feel calm. The other keeps order to look impressive. MOTIVES tries to show that difference.</p>
    <p>Read your result as a set of starting points for reflection. It can help you notice what you chase and what you avoid in daily life.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ArrowRow>Seven letters in a fixed order: <strong>M O T I V E S</strong>. The name MOTIVES is made from the seven high-pole letters. Each slot shows one of two letters, the high pole or the low pole.</ArrowRow>
    <ChipRow label="Uppercase:" href={g}><strong>Strong.</strong> Example: <code>A</code>. You lean clearly to this pole. It is a stable part of what drives you.</ChipRow>
    <ChipRow label="Lowercase:" href={g}><strong>Medium.</strong> Example: <code>g</code>. You lean to this pole, but not strongly. In some situations the other pole may show.</ChipRow>
    <ChipRow label="X:" href={g}><strong>Middle.</strong> You are between the two poles. Neither one drives you much.</ChipRow>
    <ChipRow label="|bars|:" href={g}><strong>Strongest trait.</strong> Example: <code>|O|</code>. Of your seven traits, this one is furthest from the middle. It is likely the motive other people notice first.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="dg-scroll">
      <div class="mo" role="table" aria-label="The seven MOTIVES positions with an example">
        <div class="mo-row" role="row"><span class="dg-label" role="rowheader">Position</span>{#each COLS as c (c[0])}<b role="cell">{c[0]}</b>{/each}</div>
        <div class="mo-row" role="row"><span class="dg-label" role="rowheader">High pole</span>{#each COLS as c (c[0])}<a class="dg-letter" role="cell" href={g}>{c[1]}</a>{/each}</div>
        <div class="mo-row" role="row"><span class="dg-label" role="rowheader">Low pole</span>{#each COLS as c (c[0])}<a class="dg-letter low" role="cell" href={g}>{c[2]}</a>{/each}</div>
        <div class="mo-row ex" role="row"><span class="dg-label" role="rowheader">Example</span>{#each COLS as c (c[0])}<span role="cell"><code>{c[3]}</code><small>{c[4]}</small></span>{/each}</div>
      </div>
    </div>
    <p class="dg-note">Each column is one trait with two poles. Your code takes one letter from each column. The example row shows how strength is written.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">1. M / A: Materialistic or Ascetic</h3>
    <ArrowRow>This trait is about how much looks, money and status drive you.</ArrowRow>
    <ChipRow label="M (Materialistic):" href={g}>You want looks, status and an impressive life. You may care about brands, a nice home or how others see your success. These goals can push you to work hard and aim high.</ChipRow>
    <ChipRow label="A (Ascetic):" href={g}>You care less about looks, money or status. You may wear the same clothes for years and feel fine. Simple living feels natural, not like a sacrifice. You may find status games tiring.</ChipRow>

    <h3 class="sub">2. O / C: Offbeat or Conventional</h3>
    <ArrowRow>This trait is about how much you look for the new and unusual.</ArrowRow>
    <ChipRow label="O (Offbeat):" href={g}>You like new things, experiments and unusual paths. You may pick the strange item on the menu, or a career that few people choose. Normal can feel boring to you.</ChipRow>
    <ChipRow label="C (Conventional):" href={g}>You prefer what is known. Change and experiments attract you less. You trust methods that have worked for many people. You may feel at home in clear roles and traditions.</ChipRow>

    <h3 class="sub">3. T / H: Thinking or Haphazard</h3>
    <ArrowRow>This trait is about planning and order in daily life.</ArrowRow>
    <ChipRow label="T (Thinking):" href={g}>You like a planned, structured and orderly life. You think before you act and like to know the plan. A messy schedule can make you uneasy.</ChipRow>
    <ChipRow label="H (Haphazard):" href={g}>You follow plans less often. Your life is less organized. You may decide on the day and go with the flow. You can adapt fast, but you may forget tasks without reminders.</ChipRow>

    <h3 class="sub">4. I / W: Interpersonal or Withholding</h3>
    <ArrowRow>This trait is about how much you put other people first.</ArrowRow>
    <ChipRow label="I (Interpersonal):" href={g}>Helping and caring for others comes first for you. You may be the friend who remembers birthdays or checks in when someone is sick. Other people's problems can feel like your own.</ChipRow>
    <ChipRow label="W (Withholding):" href={g}>You give less priority to helping or giving way to others. You keep your time and energy for your own goals. You may help when asked, but you do not look for chances to help.</ChipRow>

    <h3 class="sub">5. V / D: Vital or Depressed</h3>
    <ArrowRow>This trait is about your usual energy and outlook on life.</ArrowRow>
    <ChipRow label="V (Vital):" href={g}>You feel positive, energetic and happy with life. You wake up with plans and expect things to work out. Setbacks do not stop you for long.</ChipRow>
    <ChipRow label="D (Depressed):" href={g}>You feel pessimistic and low, and you can work against yourself. You may expect things to go wrong. You may give up on goals before you start.</ChipRow>

    <h3 class="sub">6. E / R: Easygoing or Rigid</h3>
    <ArrowRow>This trait is about tension and your need for calm.</ArrowRow>
    <ChipRow label="E (Easygoing):" href={g}>Calm and rest come first for you. You do not let small things upset you. You may enjoy slow days with no plan.</ChipRow>
    <ChipRow label="R (Rigid):" href={g}>You find it hard to relax. You are often tense. You may keep thinking about work after hours. Rules and routines can feel safer than free time.</ChipRow>

    <h3 class="sub">7. S / G: Sectarian or Globalistic</h3>
    <ArrowRow>This trait is about how wide your circle of concern is.</ArrowRow>
    <ChipRow label="S (Sectarian):" href={g}>You put your own group, nation or culture first. Loyalty to your people is important to you. You may feel that each group should look after its own.</ChipRow>
    <ChipRow label="G (Globalistic):" href={g}>You favor inclusion and the welfare of the whole world. You may care about people far away as much as your neighbors. Borders between groups matter less to you.</ChipRow>
    <ChipRow label="WARNING:">In MOTIVES, "Depressed" is a trait name. It is not a medical diagnosis. If you feel low most days, talk to a health professional.</ChipRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Read the seven letters in M-O-T-I-V-E-S order. Each slot is always the same trait.</ArrowRow>
    <ArrowRow>Uppercase letters are strong traits. Lowercase letters are medium. Start with the uppercase letters. They show your clearest motives.</ArrowRow>
    <ArrowRow><code>X</code> means you are in the middle for that position. That motive does not push you either way.</ArrowRow>
    <ArrowRow>The letter between bars, such as <code>|O|</code>, is your strongest trait.</ArrowRow>
    <ArrowRow>Example: <code>A|O|XIVRg</code> = Ascetic, strongest Offbeat, middle on order, Interpersonal, Vital, Rigid, medium Globalistic. This person cares little for status, loves the unusual, helps others and has energy, but finds it hard to relax.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>MOTIVES E and R are not SLOAN E and R.</strong> In MOTIVES, E = Easygoing and R = Rigid. In SLOAN, E = Egocentric and R = Reserved.</ArrowRow>
    <ArrowRow><strong>MOTIVES T is not Jungian Thinking.</strong> In MOTIVES, T means a planned, orderly life. Jungian Thinking is a way to make decisions.</ArrowRow>
    <ArrowRow><strong>MOTIVES I is not Introversion.</strong> In MOTIVES, I means Interpersonal: care for others.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .mo { display: grid; gap: 0.3rem; min-width: 30rem; font: 12px/1.3 var(--font-body); }
  .mo-row { display: grid; grid-template-columns: 6rem repeat(7, minmax(0, 1fr)); gap: 0.4rem; align-items: center; justify-items: center; }
  .mo-row > :first-child { justify-self: start; }
  .mo :global(.dg-letter) { width: 2.2rem; line-height: 1.8; }
  .mo .low { background: var(--tan); }
  .ex span { display: grid; justify-items: center; }
  .ex code { font: bold 15px var(--font-mono); }
  .ex small { font-size: 10px; color: var(--meta); }
  @media (max-width: 760px) {
    .mo { min-width: 0; gap: 0.25rem; }
    .mo-row { grid-template-columns: 4.6rem repeat(7, minmax(0, 1fr)); gap: 0.2rem; }
    .mo :global(.dg-letter) { width: 100%; min-width: 0; }
    .ex code { font-size: 13px; }
    .ex small { font-size: 8.5px; text-align: center; }
  }
</style>
