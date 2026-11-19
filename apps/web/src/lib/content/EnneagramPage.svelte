<script lang="ts">
  // Enneagram page text: CONTENT.md §7. Do not reword.
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
  facts={["9 TYPES", "3 CENTERS", "3 INSTINCTS"]}
  format="About 20–28 choices and rankings · in 4 parts"
  extra="The test has four parts in this order: core type, wing, instincts and tritype. At the end of part 1, you read the two closest types and pick one.">

  {#snippet overview()}
    <p>The Enneagram describes nine types. Each type centers on one core desire and one core fear. The name comes from the Greek words for "nine" and "drawing", because the types sit on a nine-point circle.</p>
    <p>Many systems describe what you do. The Enneagram asks why you do it. Two people can both work late every night. One does it to feel valuable (type 3). The other does it to feel safe and prepared (type 6). The behavior is the same, but the reason is different.</p>
    <p>The modern Enneagram of personality grew in the 1960s and 1970s, mostly from the work of Oscar Ichazo and Claudio Naranjo. Later writers added wings, instincts and tritype. These parts make the result more detailed, but fewer studies support them.</p>
    <p>Many people use the Enneagram for personal growth. Each type has a typical blind spot. Knowing your type can help you notice when your core fear drives a choice.</p>
  {/snippet}

  {#snippet notation()}
    <ChipRow label="EXAMPLE:"><code>{exampleFor(t.slug)}</code> A random code. Each visit shows a new one.</ChipRow>
    <ChipRow label="1w2:" href={g}><strong>Core and wing.</strong> Core type 1 with a 2 wing. The "w" means "wing". The wing is always one of the two numbers next to the core on the circle.</ChipRow>
    <ChipRow label="127:" href={g}><strong>Tritype.</strong> One type from each center, strongest first. The first number is always your core type.</ChipRow>
    <ChipRow label="so/sx/sp:" href={g}><strong>Instinct order.</strong> Strongest first. The last instinct is the one you give the least attention.</ChipRow>
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
        <li><span class="sw gut"></span><b>GUT center:</b> 8 · 9 · 1<br /><small>(anger, instinct)</small></li>
        <li><span class="sw heart"></span><b>HEART center:</b> 2 · 3 · 4<br /><small>(image, shame)</small></li>
        <li><span class="sw head"></span><b>HEAD center:</b> 5 · 6 · 7<br /><small>(fear, thinking)</small></li>
        <li><span class="sw ring-sw"></span>example tritype <code>127</code></li>
      </ul>
    </div>
    <h3 class="sub">How your Enneagram result is built:</h3>
    <div class="dg-table built">
      <div class="dg-row"><span class="dg-label">Core type</span><code>1</code><span>your main type</span></div>
      <div class="dg-row"><span class="dg-label">Wing</span><code>1w2</code><span>a neighbor of the core: 1 can have wing 9 or 2</span></div>
      <div class="dg-row"><span class="dg-label">Tritype</span><code>127</code><span>one type per center: 1 (gut) · 2 (heart) · 7 (head)</span></div>
      <div class="dg-row"><span class="dg-label">Instincts</span><code>so/sx/sp</code><span>social first · one-to-one second · self-preservation last</span></div>
    </div>
    <p class="dg-note">The circle shows the nine types. The colors show the three centers. Your result starts with one core type, then adds the details below.</p>
  {/snippet}

  {#snippet parts()}
    <h3 class="sub">The nine types</h3>
    <ChipRow label="1:" href={g}><strong>Reformer</strong> · Wants: To be good and right · Fears: To be bad or wrong. You notice what could be better and feel a duty to fix it. You may have a strong inner critic. Others see you as fair and reliable, but sometimes strict.</ChipRow>
    <ChipRow label="2:" href={g}><strong>Helper</strong> · Wants: To be loved · Fears: To be unwanted. You notice what others need and give it, often before they ask. You may find it hard to ask for help yourself. Others see you as warm, but you may feel unseen.</ChipRow>
    <ChipRow label="3:" href={g}><strong>Achiever</strong> · Wants: To be valuable · Fears: To be worthless. You set goals and work hard to reach them. You adapt your image to what people admire. You may feel that you are what you achieve.</ChipRow>
    <ChipRow label="4:" href={g}><strong>Individualist</strong> · Wants: To have a unique identity · Fears: To have no identity. You feel things deeply and want to be truly yourself. You may feel that something is missing that other people have. Art and beauty often matter to you.</ChipRow>
    <ChipRow label="5:" href={g}><strong>Investigator</strong> · Wants: To be capable · Fears: To be useless or helpless. You want to understand how things work before you act. You protect your time and energy. You may watch from a distance more than you join in.</ChipRow>
    <ChipRow label="6:" href={g}><strong>Loyalist</strong> · Wants: To have security and support · Fears: To have no support. You look for what could go wrong and prepare for it. You are loyal to people and groups you trust. You may doubt yourself and test others before you trust them.</ChipRow>
    <ChipRow label="7:" href={g}><strong>Enthusiast</strong> · Wants: To be satisfied · Fears: To feel pain or lack. You look for fun, options and new experiences. You keep plans open in case something better comes. You may avoid sad feelings by staying busy.</ChipRow>
    <ChipRow label="8:" href={g}><strong>Challenger</strong> · Wants: To control their own life · Fears: To be controlled or harmed. You are strong, direct and protective. You take charge when nobody else does. You may hide softness, because it feels like weakness.</ChipRow>
    <ChipRow label="9:" href={g}><strong>Peacemaker</strong> · Wants: To have inner peace · Fears: To lose connection. You see every side and keep things calm. You go along with others to avoid conflict. You may lose track of what you want yourself.</ChipRow>

    <h3 class="sub">Centers</h3>
    <ArrowRow>The nine types fall into three groups of three. Each group shares one main emotion and one way of first reacting to life.</ArrowRow>
    <ChipRow label="Gut (8, 9, 1):" href={g}>These types react first from instinct. Anger is a main theme. Type 8 shows anger. Type 9 pushes it down. Type 1 turns it into a drive to correct things.</ChipRow>
    <ChipRow label="Heart (2, 3, 4):" href={g}>These types react first from feelings and image. Shame is a main theme. They ask "How do others see me?" in different ways.</ChipRow>
    <ChipRow label="Head (5, 6, 7):" href={g}>These types react first from thinking. Fear is a main theme. Type 5 pulls back. Type 6 prepares. Type 7 runs toward new options.</ChipRow>

    <h3 class="sub">Wing</h3>
    <ArrowRow>Your wing is one of the two types next to your core on the circle. It adds some of its traits to your core type. Type 1 can have a 9 wing or a 2 wing. Example: a 1w9 is a calmer, more private Reformer. A 1w2 is a warmer, more people-focused Reformer.</ArrowRow>

    <h3 class="sub">Instincts</h3>
    <ArrowRow>Instincts describe where you put your attention to survive and do well. Everyone has all three. The order shows which one comes first.</ArrowRow>
    <ChipRow label="sp:" href={g}><strong>Self-preservation.</strong> Safety, health, money and comfort. You may check that the bills are paid and the fridge is full before you relax.</ChipRow>
    <ChipRow label="so:" href={g}><strong>Social.</strong> Your place and role in groups. You notice who belongs, who leads and how you fit in a team or community.</ChipRow>
    <ChipRow label="sx:" href={g}><strong>Sexual or one-to-one.</strong> Strong one-to-one connection and intensity. You look for deep bonds and a "spark" with a few people or passions.</ChipRow>
    <ArrowRow>Your stacking puts the three in order. The last one is your "blind spot": you give it the least attention.</ArrowRow>

    <h3 class="sub">Tritype</h3>
    <ArrowRow>Your tritype takes your strongest type from each center. The first number is your core type. Example: <code>127</code> = core 1 (gut), then 2 (heart), then 7 (head). The idea is that you use one strategy from each center, in that order, when the main one does not work.</ArrowRow>
  {/snippet}

  {#snippet read()}
    <ArrowRow>Find your core type. It is the first number of your tritype and the first number of your wing code. Read its desire and fear first. Ask yourself if they explain your choices.</ArrowRow>
    <ArrowRow>Read the wing. <code>1w2</code> means type 1 with some traits of type 2.</ArrowRow>
    <ArrowRow>Read the tritype from left to right, strongest first.</ArrowRow>
    <ArrowRow>Read the instincts from left to right, strongest first. The last one may show an area of life you tend to neglect.</ArrowRow>
    <ArrowRow>If the core type does not feel right, read the two closest types. Many people find their type by reading descriptions, not only by test scores.</ArrowRow>
  {/snippet}

  {#snippet mixups()}
    <ArrowRow><strong>The sexual instinct is not only about sex.</strong> It means intensity in one-to-one connection.</ArrowRow>
    <ArrowRow><strong>Your wing can only be a neighbor.</strong> <code>1w5</code> is not a valid code.</ArrowRow>
    <ArrowRow><strong>Instincts can look like a center.</strong> A strong sx instinct can look like a heart type. So the test asks about instincts after it finds your core type.</ArrowRow>
    <ArrowRow><strong>Type numbers are not a ranking.</strong> Type 9 is not better than type 1. The numbers only mark places on the circle.</ArrowRow>
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
