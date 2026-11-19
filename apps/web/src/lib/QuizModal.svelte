<script lang="ts">
  import { onMount, tick, untrack, type Snippet } from "svelte";
  import type { Explanation, ItemView, Response } from "@typo/engine-sdk";
  import { app } from "./app.svelte.ts";
  import { LOADERS, type AnyEngine } from "./engines.ts";
  import type { Typology } from "./typologies.ts";

  /**
   * Full-screen quiz: the engine's whole fixed form is printed at once as one long scrollable page.
   * Answers can be given in any order and changed freely; nothing is saved until "See my result".
   */
  let { t, result: resultView, onclose, instructions = [] }: { t: Typology; result: Snippet<[unknown, number]> } & { onclose: () => void; instructions?: string[] } = $props();
  const slug = untrack(() => t.slug);

  let engine = $state<AnyEngine | null>(null);
  let form = $state<ItemView[]>([]);
  let answers = $state<Record<string, Response>>({});
  let rankPick = $state<Record<string, string[]>>({});
  let finalState = $state<unknown>(null);
  let loadError = $state<string | null>(null);
  let confirmExit = $state(false);

  let dlg: HTMLDialogElement | undefined = $state();
  let exitDlg: HTMLDialogElement | undefined = $state();
  let scroller: HTMLDivElement | undefined = $state();


  const answeredCount = $derived(form.filter(v => answers[v.id] !== undefined).length);
  const left = $derived(form.length - answeredCount);
  const result = $derived(engine && finalState ? engine.result(finalState) : null);
  const explanations: Explanation[] = $derived(engine && finalState ? engine.explain(finalState) : []);

  onMount(() => {
    dlg?.showModal();
    LOADERS[slug]!().then(e => { engine = e; form = e.form(e.init(app.profileSnapshot())); }).catch(err => (loadError = String(err)));
  });

  $effect(() => {
    if (!exitDlg) return;
    if (confirmExit && !exitDlg.open) exitDlg.showModal();
    if (!confirmExit && exitDlg.open) exitDlg.close();
  });

  function setAnswer(item: ItemView, r: Response) {
    answers = { ...answers, [item.id]: r };
  }

  function tapRank(item: ItemView, id: string) {
    const n = item.options!.length;
    const cur = rankPick[item.id] ?? [];
    let next = cur.includes(id) ? cur.slice(0, cur.indexOf(id)) : [...cur, id];
    if (next.length === n - 1) next = [...next, item.options!.find(o => !next.includes(o.id))!.id];
    rankPick = { ...rankPick, [item.id]: next };
    if (next.length === n) setAnswer(item, next);
    else if (answers[item.id] !== undefined) { const { [item.id]: _, ...rest } = answers; answers = rest; }
  }

  async function submit() {
    if (!engine || left > 0) return;
    let s = engine.init(app.profileSnapshot());
    for (const v of form) s = engine.answer(s, v.id, answers[v.id]!);
    finalState = s;
    await app.saveResult(engine.meta.id, engine.result(s)); // kept only as a prior for other tests
    await tick(); scroller?.scrollTo({ top: 0 });
  }


  function requestClose() { if (finalState || answeredCount === 0) close(); else confirmExit = true; }
  function close() { confirmExit = false; dlg?.close(); onclose(); }
  function restart() { answers = {}; rankPick = {}; finalState = null; scroller?.scrollTo({ top: 0 }); }

  /** Ranking options in a shuffled but stable order per question, so position never biases the answer. */
  function shuffled<T>(xs: T[], key: string): T[] {
    let h = 2166136261;
    for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
    return a;
  }
  const rankNo = (item: ItemView, id: string) => {
    const order = rankPick[item.id] ?? (answers[item.id] as string[] | undefined) ?? [];
    const k = order.indexOf(id); return k < 0 ? null : k + 1;
  };
  const hint = (it: ItemView) => it.format === "rank" ? (/in order/i.test(it.text) ? "Tap each box in order." : "Tap in order, most like you first.") : it.format === "likert5" ? "" : "Choose one";
</script>

<dialog bind:this={dlg} class="quiz" aria-labelledby="quiz-title" oncancel={e => { e.preventDefault(); requestClose(); }}>
  <div class="frame-cols">
    <div class="glass" aria-hidden="true"></div>
    <div class="colwrap">
      <header class="qhead">
        <h2 id="quiz-title" class="qtitle">{t.navName}</h2>
        <button class="x" onclick={requestClose} aria-label="Close the quiz"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.4 2.3 8 6.9l4.6-4.6 1.1 1.1L9.1 8l4.6 4.6-1.1 1.1L8 9.1l-4.6 4.6-1.1-1.1L6.9 8 2.3 3.4z" fill="currentColor" /></svg></button>
      </header>
      <div class="progress" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={form.length || 1}
        aria-valuenow={result ? form.length : answeredCount} aria-valuetext="{result ? form.length : answeredCount} of {form.length} answered">
        <span style="width: {form.length ? ((result ? form.length : answeredCount) / form.length) * 100 : 0}%"></span>
      </div>
    <div class="column" bind:this={scroller}>

      {#if loadError}
        <p role="alert">Could not load the test: {loadError}</p>
      {:else if !engine}
        <p>Loading…</p>
      {:else if result}
        <section class="results" aria-label="Your result">
          <div class="result-body">{@render resultView(result, form.length)}</div>
          <h3 class="post-title">What drove this result</h3>
          {#each explanations as ex (ex.output)}
            <section class="mini">
              <h4 class="mini-head">{ex.output}: {ex.result}</h4>
              {#if ex.topEvidence.length}
                <ul>{#each ex.topEvidence as e (e.itemId)}<li>{e.answer}{#if e.delta}<span class="meta">&nbsp;({e.delta > 0 ? "+" : ""}{e.delta})</span>{/if}</li>{/each}</ul>
              {/if}
              {#if ex.runnerUp}<p class="meta">Runner-up: {ex.runnerUp.result} ({Math.round(ex.runnerUp.confidence * 100)}%)</p>{/if}
            </section>
          {/each}
          <p class="meta">Question weights are expert placeholders until calibration.</p>
          <p class="actions">
            <button class="btn tan" onclick={restart}>Retake</button>
            <button class="btn" onclick={close}>Done</button>
          </p>
        </section>
      {:else}
        <div class="intro-line">
          <p><strong>{form.length} questions.</strong> You can change any answer before you finish.</p>
          {#if instructions.length}<ul class="instr">{#each instructions as s (s)}<li>{s}</li>{/each}</ul>{/if}
        </div>
        <ol class="qlist">
          {#each form as item (item.id)}
            <li class="q" id="q-{item.id}">
              <p class="qtext">{item.text}</p>
              {#if hint(item)}<p class="qhint">{hint(item)}</p>{/if}
              {#if item.format === "likert5"}
                <div class="likert" role="radiogroup" aria-label={item.text}>
                  {#each item.options ?? [] as o, k (o.id)}
                    <button class="box" class:on={answers[item.id] === k + 1} role="radio" aria-checked={answers[item.id] === k + 1}
                      onclick={() => setAnswer(item, k + 1)}>{o.text}</button>
                  {/each}
                </div>
              {:else if item.format === "rank"}
                <div class="wide" role="group" aria-label={item.text}>
                  {#each shuffled(item.options ?? [], item.id) as o (o.id)}
                    {@const r = rankNo(item, o.id)}
                    <button class="box" class:on={r !== null} aria-pressed={r !== null} onclick={() => tapRank(item, o.id)}>
                      {#if r !== null}<span class="rank">{r}</span>{/if}{o.text}
                    </button>
                  {/each}
                </div>
              {:else}
                <div class="wide" class:many={(item.options?.length ?? 0) > 4} role="radiogroup" aria-label={item.text}>
                  {#each item.options ?? [] as o (o.id)}
                    <button class="box" class:on={answers[item.id] === Number(o.id)} role="radio" aria-checked={answers[item.id] === Number(o.id)}
                      onclick={() => setAnswer(item, Number(o.id))}>{o.text}</button>
                  {/each}
                </div>
              {/if}
            </li>
          {/each}
        </ol>
        <footer class="submit">
          <button class="btn big" onclick={submit} disabled={left > 0}>See my result</button>
          {#if left > 0}
            <p class="meta">{left} still unanswered.</p>
          {/if}
        </footer>
      {/if}
    </div>
    </div>
    <div class="glass" aria-hidden="true"></div>
  </div>
</dialog>

<dialog bind:this={exitDlg} class="exit" aria-labelledby="exit-title" oncancel={e => { e.preventDefault(); confirmExit = false; }}>
  <h3 id="exit-title" class="post-title">Leave the quiz?</h3>
  <p class="warn-line"><strong>Your answers will not be saved.</strong> If you leave now, you will start over next time.</p>
  <p class="actions">
    <button class="btn tan" onclick={() => (confirmExit = false)}>Keep going</button>
    <button class="btn" onclick={close}>Leave without saving</button>
  </p>
</dialog>

<style>
  .quiz {
    position: fixed; inset: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none;
    margin: 0; padding: 0; border: 0; background: transparent; color: var(--text);
  }
  .quiz::backdrop { background: transparent; }
  .frame-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 720px) minmax(0, 1fr); height: 100%; }
  /* clear glass: the page shows through, softly blurred */
  .glass {
    background: rgb(255 255 255 / 0.06);
    backdrop-filter: blur(10px) saturate(1.1); -webkit-backdrop-filter: blur(10px) saturate(1.1);
  }
  .glass:first-child { border-right: 1px solid rgb(255 255 255 / 0.35); }
  .glass:last-child { border-left: 1px solid rgb(255 255 255 / 0.35); }
  /* the modal column is styled like the site: rust header bar + cream panel with a double inner rule */
  .quiz[open] .colwrap { animation: col-in 220ms var(--ease-out); }
  .quiz[open] .glass { animation: fade-in 220ms var(--ease-out); }
  .exit[open] { animation: exit-in var(--dur) var(--ease-out); }
  @keyframes col-in { from { opacity: 0; transform: translateY(8px); } }
  @keyframes fade-in { from { opacity: 0; } }
  @keyframes exit-in { from { opacity: 0; transform: scale(0.97); } }
  .colwrap { display: flex; flex-direction: column; min-height: 0; height: 100%; box-shadow: 0 0 22px rgb(0 0 0 / 0.35); }
  .column {
    position: relative; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
    background: var(--cream); border: 1px solid #f6dcc6; border-top: 0;
    box-shadow: inset 0 0 0 3px var(--cream), inset 0 0 0 4px #e9cbb3;
    padding: 1.2rem clamp(16px, 4vw, 48px) calc(6rem + env(safe-area-inset-bottom));
    scrollbar-width: none;
  }
  .column::-webkit-scrollbar { display: none; }
  .progress { height: 8px; background: var(--sky); box-shadow: inset 0 1px 2px rgb(30 70 90 / 0.3); }
  .progress > span { display: block; height: 100%; background: linear-gradient(var(--teal), var(--teal-dark)); transition: width 250ms var(--ease-out); }

  .qhead {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    background: var(--rust-texture); padding: 0.7rem clamp(16px, 4vw, 48px);
    border-bottom: 3px solid var(--tan);
  }
  .qtitle { font: 2rem/1.1 var(--font-logo); color: var(--cream); text-shadow: 1px 1px 0 rgb(0 0 0 / 0.3); }
  .x {
    flex: none; display: grid; place-items: center; width: 38px; height: 38px; color: var(--cream); background: rgb(0 0 0 / 0.12);
    border: 1px solid rgb(255 255 255 / 0.5); cursor: pointer; transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
  }
  .x:hover { background: var(--cream); color: var(--rust); }
  .intro-line { color: var(--meta); margin: 0 0 1.2rem; text-align: center; }

  .qlist { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.6rem; }
  .q { scroll-margin-top: 90px; }
  /* question sentence, hint and box row are all centered */
  .qtext { margin: 0 0 0.5rem; font: 13px/1.5 var(--font-body); color: var(--text); text-align: center; }
  .qhint { margin: -0.3rem 0 0.4rem; font-size: 10.5px; color: var(--meta); text-align: center; }

  .likert { display: grid; grid-template-columns: repeat(5, min(64px, 17vw)); gap: 6px; justify-content: center; }
  .wide { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; max-width: 520px; margin: 0 auto; }
  .wide > :global(*) { flex: 0 1 calc((100% - 12px) / 3); min-width: min(100%, 150px); }
  .wide.many { max-width: 600px; }
  .wide.many > :global(*) { flex-basis: calc((100% - 12px) / 3); min-width: min(100%, 180px); }
  .box {
    position: relative; display: grid; place-items: center; text-align: center;
    padding: 0.35rem 0.3rem; font: 10.5px/1.25 var(--font-body); color: var(--text); background: #fffaf4;
    border: 1.5px solid #3b2b22; cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
  }
  .likert .box { aspect-ratio: 1 / 1; }
  .wide .box { min-height: 60px; padding: 0.55rem 0.7rem; font-size: 11px; }
  .wide.many .box { place-items: center start; text-align: left; font-size: 10.5px; }
  .wide .box:has(.rank) { padding-top: 1.45rem; }
  .box:hover { background: var(--teal); color: var(--white); border-color: var(--teal-dark); }
  .box:active { transform: scale(0.97); }
  .box.on { background: var(--teal-dark); color: var(--white); border-color: var(--teal-dark); }
  .box:focus-visible { outline: 3px solid var(--rust); outline-offset: 2px; }
  .rank {
    position: absolute; top: 5px; left: 5px; width: 18px; height: 18px; display: grid; place-items: center;
    background: var(--rust); color: var(--white); font: bold 11px var(--font-head);
  }

  .submit { margin-top: 2rem; padding-top: 1rem; border-top: 3px double var(--rule); text-align: center; }
  .btn.big { font-size: 13px; padding: 0.6rem 1.6rem; }
  .results { display: grid; gap: 0.6rem; }
  .result-body { padding: 0.4rem 0 0.6rem; }
  .actions { display: flex; gap: 0.8rem; justify-content: flex-end; flex-wrap: wrap; }

  .exit {
    max-width: min(26rem, calc(100vw - 2rem)); padding: 1.2rem 1.4rem; background: var(--cream); color: var(--text);
    border: 1px solid var(--panel-border); box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
  }
  .exit::backdrop { background: rgb(40 15 5 / 0.35); backdrop-filter: blur(2px); }
  .warn-line { background: var(--cream-dark); border-left: 3px solid var(--rust); padding: 0.5rem 0.7rem; }

  @media (max-width: 760px) {
    .frame-cols { grid-template-columns: 10px minmax(0, 1fr) 10px; }
    .likert { gap: 4px; }
    .box { font-size: 9.5px; padding: 0.2rem; }
    .qtitle { font-size: 1.6rem; }
    .column { border: 0; box-shadow: none; }
  }
  @media (prefers-reduced-motion: reduce) { .box, .progress > span { transition: none; } .colwrap, .glass, .exit { animation: none !important; } .box:active { transform: none; } }
  .instr { margin: 0.3rem 0 0; padding-left: 1.2rem; }
  .instr li { margin: 0.15rem 0; }
</style>
