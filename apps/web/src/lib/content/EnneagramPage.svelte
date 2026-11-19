<script lang="ts">
  // Enneagram page.
  import type { Snippet } from "svelte";
  import ArrowRow from "$lib/page/ArrowRow.svelte";
  import ChipRow from "$lib/page/ChipRow.svelte";
  import { exampleFor } from "$lib/examples.ts";
  import type { Typology } from "$lib/typologies.ts";
  import TypologyLayout from "./TypologyLayout.svelte";
  import "./diagram.css";

  let { t, result }: { t: Typology; result: Snippet<[unknown, number]> } = $props();
  const g = "/glossary#enneagram";
  const NAMES = ["", "Reformer", "Helper", "Achiever", "Individualist", "Investigator", "Loyalist", "Enthusiast", "Challenger", "Peacemaker"];
  const TYPES = [
    ["1", "Reformer", "To be good and right", "To be bad or wrong"],
    ["2", "Helper", "To be loved", "To be unwanted"],
    ["3", "Achiever", "To be valuable", "To be worthless"],
    ["4", "Individualist", "To have a unique identity", "To have no identity"],
    ["5", "Investigator", "To be capable", "To be useless or helpless"],
    ["6", "Loyalist", "To have security and support", "To have no support"],
    ["7", "Enthusiast", "To be satisfied", "To feel pain or lack"],
    ["8", "Challenger", "To control their own life", "To be controlled or harmed"],
    ["9", "Peacemaker", "To have inner peace", "To lose connection"],
  ];
  const center = (n: number) => ([8, 9, 1].includes(n) ? "gut" : [2, 3, 4].includes(n) ? "heart" : "head");
  // 9 at the top, then clockwise 1..8
  const pt = (n: number, r: number) => { const a = ((n % 9) * 40 - 90) * (Math.PI / 180); return [160 + r * Math.cos(a), 150 + r * Math.sin(a)]; };
</script>

<TypologyLayout {t} {result} title="Enneagram"
  facts={["9 types", "3 centers", "3 instincts"]}
  format="20 to 28 choices and rankings on one page"
  extra="The questions find your core type, wing, instinct order and tritype.">

  {#snippet overview()}
    <p>The Enneagram describes nine types. Each type is built on one core want and one core fear. The name comes from the Greek words for "nine" and "drawing", because the nine types are points on a circle.</p>
    <p>Many systems describe what you do. The Enneagram asks why you do it. Two people both work late every night. One does it to feel valuable (type 3). The other does it to feel safe and prepared (type 6). The behavior is the same, but the reason is different.</p>
    <p>The modern Enneagram of personality took shape in the 1960s and 1970s, mostly in the work of Oscar Ichazo and Claudio Naranjo. Later writers added wings, instincts and tritype. These parts add detail, but fewer studies support them.</p>
    <p>Each type has a usual blind spot. If you know your core fear, you can see when it makes a decision for you.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="example:"><code>{exampleFor(t.slug)}</code> This example changes each time you load the page.</ChipRow>
    <ChipRow label="1w2:" href={g}><strong>Core and wing.</strong> Core type 1 with a 2 wing ("w" is for "wing"). The wing is always one of the two numbers next to the core on the circle.</ChipRow>
    <ChipRow label="127:" href={g}><strong>Tritype.</strong> One type from each center, strongest first. The first number is always your core type.</ChipRow>
    <ChipRow label="so/sx/sp:" href={g}><strong>Instinct order.</strong> Strongest first. You give the last instinct the least attention.</ChipRow>
  {/snippet}

  {#snippet figure()}
    <div class="en">
      <svg viewBox="-30 0 380 300" role="img" aria-label="The nine Enneagram types on a circle, grouped into three centers">
        <circle cx="160" cy="150" r="100" fill="none" stroke="var(--tan)" stroke-width="1.5" />
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as n (n)}
          {@const [x, y] = pt(n, 100)}
          {@const [lx, ly] = pt(n, 122)}
          {@const side = lx > 170 ? "start" : lx < 150 ? "end" : "middle"}
          {#if [1, 2, 7].includes(n)}<circle cx={x} cy={y} r="17.5" class="ring" />{/if}
          <circle cx={x} cy={y} r="13" class="dot {center(n)}" />
          <text x={x} y={y + 4.5} text-anchor="middle" class="num">{n}</text>
          <text x={lx + (side === "start" ? 4 : side === "end" ? -4 : 0)} y={ly + (n === 9 ? -4 : 4)} text-anchor={side} class="name">{NAMES[n]}</text>
        {/each}
      </svg>
      <ul class="centers">
        <li><span class="sw gut"></span><b>gut center:</b> 8 · 9 · 1<br /><small>(anger, instinct)</small></li>
        <li><span class="sw heart"></span><b>heart center:</b> 2 · 3 · 4<br /><small>(image, shame)</small></li>
        <li><span class="sw head"></span><b>head center:</b> 5 · 6 · 7<br /><small>(fear, thinking)</small></li>
        <li><span class="sw ring-sw"></span>example tritype <code>127</code></li>
      </ul>
    </div>
    <h3 class="sub">How your Enneagram result is built:</h3>
    <div class="dg-table built">
      <div class="dg-row"><span class="dg-label">Core type</span><code>1</code><span>your main type</span></div>
      <div class="dg-row"><span class="dg-label">Wing</span><code>1w2</code><span>a type next to the core: type 1 can have wing 9 or wing 2</span></div>
      <div class="dg-row"><span class="dg-label">Tritype</span><code>127</code><span>one type per center: 1 (gut) · 2 (heart) · 7 (head)</span></div>
      <div class="dg-row"><span class="dg-label">Instincts</span><code>so/sx/sp</code><span>social first · one-to-one second · self-preservation last</span></div>
    </div>
    <p class="dg-note">The circle shows the nine types, and the colors show the three centers. Your result starts with one core type. The table shows the other parts it adds.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The nine types</h3>
    <ChipRow label="1:" href={g}><strong>Reformer</strong> · Wants: To be good and right · Fears: To be bad or wrong. You see what could be better, and you feel that you must correct it. You may criticize yourself a lot. Other people see you as fair and reliable, but sometimes strict.</ChipRow>
    <ChipRow label="2:" href={g}><strong>Helper</strong> · Wants: To be loved · Fears: To be unwanted. You see what other people need and give it to them, often before they ask. You may find it hard to ask for help. Other people see you as warm, but you may feel that nobody sees you.</ChipRow>
    <ChipRow label="3:" href={g}><strong>Achiever</strong> · Wants: To be valuable · Fears: To be worthless. You set goals and work hard to reach them. You change how you present yourself to match what people admire. You may feel that your value is what you achieve.</ChipRow>
    <ChipRow label="4:" href={g}><strong>Individualist</strong> · Wants: To have a unique identity · Fears: To have no identity. You feel things strongly, and you want to be fully yourself. You may feel that other people have something that you do not have. Art and beauty often matter to you.</ChipRow>
    <ChipRow label="5:" href={g}><strong>Investigator</strong> · Wants: To be capable · Fears: To be useless or helpless. Before you act, you want to understand how things work. You protect your time and energy. You may watch from a distance more often than you take part.</ChipRow>
    <ChipRow label="6:" href={g}><strong>Loyalist</strong> · Wants: To have security and support · Fears: To have no support. You look for what could go wrong and prepare for it. You are loyal to the people and groups that you trust. You may doubt yourself, and you may test people before you trust them.</ChipRow>
    <ChipRow label="7:" href={g}><strong>Enthusiast</strong> · Wants: To be satisfied · Fears: To feel pain or lack. You look for fun, choices and new experiences. You keep your plans open in case something better comes. You may stay busy so that you do not feel sad.</ChipRow>
    <ChipRow label="8:" href={g}><strong>Challenger</strong> · Wants: To control their own life · Fears: To be controlled or harmed. You are strong, direct and protective. When nobody else takes control, you do. You may hide your softer side, because it feels like weakness.</ChipRow>
    <ChipRow label="9:" href={g}><strong>Peacemaker</strong> · Wants: To have inner peace · Fears: To lose connection. You see every side and keep things calm. You agree with others to avoid conflict. You may forget what you want yourself.</ChipRow>

    <h3 class="sub">Centers</h3>
    <ArrowRow>The nine types are in three groups of three, called centers. The types in a center share one main emotion and one first reaction.</ArrowRow>
    <ChipRow label="Gut (8, 9, 1):" href={g}>These types react first from instinct, and their main emotion is anger. Type 8 shows anger. Type 9 holds it down. Type 1 uses it to correct things.</ChipRow>
    <ChipRow label="Heart (2, 3, 4):" href={g}>These types react first from feeling and self-image, and their main emotion is shame. Each one asks, in its own way, "How do other people see me?"</ChipRow>
    <ChipRow label="Head (5, 6, 7):" href={g}>These types react first from thought, and their main emotion is fear. Type 5 moves back. Type 6 prepares. Type 7 moves toward new choices.</ChipRow>

    <h3 class="sub">Wing</h3>
    <ArrowRow>Your wing is one of the two types next to your core on the circle. It adds some of its traits to your core type. Type 1 can have a 9 wing or a 2 wing. A 1w9 is a calmer, more private Reformer. A 1w2 is a warmer Reformer who pays more attention to people.</ArrowRow>

    <h3 class="sub">Instincts</h3>
    <ArrowRow>Instincts describe where you put your attention to stay safe and do well. Everyone has all three. The order tells you which one comes first.</ArrowRow>
    <ChipRow label="sp:" href={g}><strong>Self-preservation.</strong> Safety, health, money and comfort. Before you relax, you may make sure that the bills are paid and there is food in the house.</ChipRow>
    <ChipRow label="so:" href={g}><strong>Social.</strong> Your place and role in groups. You see who belongs, who leads and where you fit in a team or community.</ChipRow>
    <ChipRow label="sx:" href={g}><strong>Sexual or one-to-one.</strong> Strong, close connection with one person at a time. You look for an intense bond with a few people, or a few interests.</ChipRow>
    <ArrowRow>Your stacking is the order of the three. The last one is your "blind spot": you give it the least attention.</ArrowRow>

    <h3 class="sub">Tritype</h3>
    <ArrowRow>Your tritype is your strongest type in each center. The first number is your core type. Example: <code>127</code> is core 1 (gut), then 2 (heart), then 7 (head). The theory says that when your core strategy fails, you use the next type's strategy, in that order.</ArrowRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Find your core type. It is the first number of your tritype and of your wing code. Read its want and fear first, and ask if they explain your choices.</ArrowRow>
    <ArrowRow>Read the wing. <code>1w2</code> is type 1 with some traits of type 2.</ArrowRow>
    <ArrowRow>Read the tritype from left to right, strongest first.</ArrowRow>
    <ArrowRow>Read the instincts from left to right, strongest first. The last one can be an area of life that you neglect.</ArrowRow>
    <ArrowRow>If the core type does not fit, read the description of the runner-up type in your result. Many people find their type by reading the descriptions, not only from a test score.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>The sexual instinct is not only about sex.</strong> It means intensity in one-to-one connection.</ArrowRow>
    <ArrowRow><strong>Your wing can only be a neighbor.</strong> <code>1w5</code> is not a valid code.</ArrowRow>
    <ArrowRow><strong>An instinct can look like a center.</strong> A strong sx instinct can look like a heart type. For this reason, the test asks about instincts in separate questions.</ArrowRow>
    <ArrowRow><strong>Type numbers are not a ranking.</strong> Type 9 is not better than type 1. The numbers only mark points on the circle.</ArrowRow>
  {/snippet}
</TypologyLayout>

<style>
  .en { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1rem 2rem; }
  .en svg { width: min(100%, 360px); height: auto; }
  .ring { fill: none; stroke: var(--rust); stroke-width: 1.5; stroke-dasharray: 3 2; }
  .dot { stroke: var(--white); stroke-width: 2; }
  .gut { fill: var(--rust); background: var(--rust); }
  .heart { fill: var(--teal); background: var(--teal); }
  .head { fill: var(--tan); background: var(--tan); }
  .num { fill: var(--white); font: bold 13px var(--font-head); }
  .name { fill: var(--text); font: 11px var(--font-body); }
  .centers { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; font: 12.5px/1.4 var(--font-body); }
  .centers small { color: var(--meta); margin-left: 1.3rem; }
  .sw { display: inline-block; width: 0.8rem; height: 0.8rem; margin-right: 0.5rem; vertical-align: -1px; border-radius: 50%; }
  .ring-sw { border: 1.5px dashed var(--rust); }
  .built :global(.dg-row) { grid-template-columns: 6rem 5.5rem minmax(0, 1fr); }
</style>
