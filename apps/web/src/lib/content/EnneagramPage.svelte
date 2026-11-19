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
  // Diagram geometry: type n sits at (n mod 9) × 40°, with 9 at the top.
  const CX = 230, CY = 200, R = 120;
  const TRI = [1, 2, 7];
  const at = (deg: number, r: number) => { const a = deg * (Math.PI / 180); return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const; };
  const pt = (n: number, r = R) => at((n % 9) * 40 - 90, r);
  /** Arc from angle a to b (degrees, clockwise). `rev` draws it backwards so text on it reads upright at the bottom. */
  const arc = (a: number, b: number, r: number, rev = false) => {
    const [x1, y1] = at(rev ? b : a, r), [x2, y2] = at(rev ? a : b, r);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 ${rev ? 0 : 1} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  /** Line between two type circles, trimmed so it starts and ends at their edges. */
  const seg = (a: number, b: number) => {
    const [x1, y1] = pt(a), [x2, y2] = pt(b), dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), s = 15 / L, e = (L - 16) / L;
    return `M${(x1 + dx * s).toFixed(1)} ${(y1 + dy * s).toFixed(1)} L${(x1 + dx * e).toFixed(1)} ${(y1 + dy * e).toFixed(1)}`;
  };
  // Triangle 3-6-9 and hexad 1-4-2-8-5-7-1.
  const LINES = [[3, 6], [6, 9], [9, 3], [1, 4], [4, 2], [2, 8], [8, 5], [5, 7], [7, 1]] as const;
  // from/to = angles of the first and last type; label = where the center name sits (between two types).
  const CENTERS = [
    { key: "gut", types: [8, 9, 1], from: 230, to: 310, label: 290, note: "anger, instinct" },
    { key: "heart", types: [2, 3, 4], from: -10, to: 70, label: 10, note: "image, shame" },
    { key: "head", types: [5, 6, 7], from: 110, to: 190, label: 170, note: "fear, thinking" },
  ] as const;
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
    <div class="fx">
      <p class="fx-ex"><span class="fx-k">Example</span><code class="fx-code">so/sx/sp 127 (1w2)</code></p>
      <div class="en">
        <svg viewBox="0 20 440 350" role="img" aria-label="The nine Enneagram types on a circle, grouped into three centers, with the example tritype 1, 2 and 7 circled">
          <defs>
            <marker id="en-arrow" viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0 0.5 L6 3 L0 5.5z" class="arrow" />
            </marker>
          </defs>
          {#each LINES as [a, b] (`${a}-${b}`)}<path d={seg(a, b)} class="inner" marker-end="url(#en-arrow)" />{/each}
          {#each CENTERS as c (c.key)}
            <path d={arc(c.from - 17, c.to + 17, R)} class="band {c.key}" />
            <path id="en-l-{c.key}" d={arc(c.label - 30, c.label + 30, c.key === "head" ? R - 19 : R - 26, c.key === "head")} fill="none" />
            <text class="cname {c.key}"><textPath href="#en-l-{c.key}" startOffset="50%" text-anchor="middle">{c.key}</textPath></text>
          {/each}
          {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as n (n)}
            {@const [x, y] = pt(n)}
            {@const [lx, ly] = pt(n, R + 26)}
            {@const anchor = lx > CX + 8 ? "start" : lx < CX - 8 ? "end" : "middle"}
            {@const y0 = n === 9 ? ly - 14 : n === 4 || n === 5 ? ly + 6 : ly - 3}
            {#if TRI.includes(n)}<circle cx={x} cy={y} r="17.5" class="tri" />{/if}
            <circle cx={x} cy={y} r="12.5" class="dot {center(n)}" />
            <text x={x} y={y + 4.5} text-anchor="middle" class="num">{n}</text>
            <text x={lx} y={y0} text-anchor={anchor} class="name" class:on={TRI.includes(n)}><tspan class="the" x={lx}>The</tspan><tspan x={lx} dy="13.5">{NAMES[n]}</tspan></text>
          {/each}
        </svg>
        <div class="side">
          <ul class="legend">
            {#each CENTERS as c (c.key)}
              <li><span class="sw {c.key}"></span><span><span class="fx-k">{c.key} center</span> <span class="lt">{c.types.join(" · ")}</span><small>{c.note}</small></span></li>
            {/each}
            <li><span class="sw ring"></span><span><span class="fx-k">example tritype</span> <span class="lt on">127</span></span></li>
          </ul>
          <h3 class="fx-k sub">How your result is built</h3>
          <dl class="fx-dl">
            <dt class="fx-k">Core type</dt><dd><code>1</code></dd><dd>your main type</dd>
            <dt class="fx-k">Wing</dt><dd><code>1w2</code></dd><dd>a type next to the core: type 1 can have wing 9 or wing 2</dd>
            <dt class="fx-k">Tritype</dt><dd><code>127</code></dd><dd>one type per center: 1 (gut) · 2 (heart) · 7 (head)</dd>
            <dt class="fx-k">Instincts</dt><dd><code>so/sx/sp</code></dd><dd>social first · one-to-one second · self-preservation last</dd>
          </dl>
        </div>
      </div>
      <p class="fx-cap">Colours mark the three centers. Your result starts from one core type.</p>
    </div>
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
  .en { --gut: var(--rust); --heart: var(--teal-dark); --head: #9a7656;
    display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(15rem, 1fr); gap: var(--fx-5); align-items: center; }
  .en svg { width: 100%; max-width: 460px; height: auto; justify-self: center; overflow: visible; }
  .band { fill: none; stroke-width: 3; }
  .band.gut { stroke: var(--gut); } .band.heart { stroke: var(--heart); } .band.head { stroke: var(--head); }
  .inner { fill: none; stroke: var(--meta); stroke-width: 0.8; opacity: 0.45; }
  .arrow { fill: var(--meta); opacity: 0.6; }
  .dot { stroke: #fcfaf5; stroke-width: 2; }
  .dot.gut { fill: var(--gut); } .dot.heart { fill: var(--heart); } .dot.head { fill: var(--head); }
  .tri { fill: none; stroke: var(--text); stroke-width: 1.75; }
  .num { fill: var(--white); font: bold 13px var(--font-head); }
  .name { fill: var(--text); font: 12.5px var(--font-body); }
  .name.on { font-weight: bold; }
  .the { fill: var(--meta); font-size: 10.5px; font-weight: normal; }
  .cname { font: 9px var(--font-head); letter-spacing: 0.04em; text-transform: lowercase; }
  .cname.gut { fill: var(--gut); } .cname.heart { fill: var(--heart); } .cname.head { fill: var(--head); }
  .legend { list-style: none; padding: 0; display: grid; gap: var(--fx-2); }
  .legend li { display: grid; grid-template-columns: 1.25rem minmax(0, 1fr); align-items: baseline; }
  .legend small { display: block; font-size: 11px; color: var(--meta); }
  .sw { width: 10px; height: 10px; border-radius: 50%; }
  .sw.gut { background: var(--gut); } .sw.heart { background: var(--heart); } .sw.head { background: var(--head); }
  .sw.ring { box-sizing: border-box; border: 1.75px solid var(--text); width: 12px; height: 12px; }
  .sub { margin: var(--fx-5) 0 var(--fx-3) !important; }
  @media (max-width: 760px) {
    .en { grid-template-columns: 1fr; gap: var(--fx-4); }
    .sub { margin-top: var(--fx-4) !important; }
  }
</style>
