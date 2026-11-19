// App state (Svelte 5 runes) persisted to IndexedDB. Private mode: nothing is uploaded.
import { idbDelete, idbGet, idbSet } from "./db.ts";
import { cleanOutdated, dependantsOf, resultStatus, type ResultStatus } from "./saved.ts";

interface Saved {
  v: 2;
  /** Serialized engine state so a test can be resumed. */
  engineStates: Record<string, string>;
  /** Finished test results, read only as optional priors by other tests. Each carries meta.scoringVersion (X-03). */
  results: Record<string, unknown>;
  /** Saved results whose input (e.g. Big Five) was replaced after they were made. */
  outdated: Record<string, true>;
}
const KEY = "session";
const empty = (): Saved => ({ v: 2, engineStates: {}, results: {}, outdated: {} });
/** Saved results carry `meta.scoringVersion` (bigfive-2 onward); older ones have none and are still read as priors. */
const objects = (r: unknown): Record<string, unknown> => Object.fromEntries(
  Object.entries(r && typeof r === "object" ? r : {}).filter(([, v]) => v !== null && typeof v === "object" && !Array.isArray(v)));
const strings = (r: unknown): Record<string, string> => Object.fromEntries(
  Object.entries(r && typeof r === "object" ? r : {}).filter(([, v]) => typeof v === "string")) as Record<string, string>;

class AppState {
  loaded = $state(false);
  data = $state<Saved>(empty());
  storageError = $state<string | null>(null);

  async load() {
    try {
      const s = await idbGet<{ v: number } & Partial<Saved>>(KEY);
      if (s?.v === 2) { // older saves may carry a bio (dropped) and no `outdated` map (starts empty)
        const { engineStates = {}, results = {}, outdated = {} } = s as Partial<Saved>;
        const res = objects(results);
        this.data = { v: 2, engineStates: strings(engineStates), results: res, outdated: cleanOutdated(outdated, res) };
      }
      else if (s) this.data = { ...empty(), engineStates: strings(s.engineStates) }; // v1 → v2
    } catch (e) { console.error(e); this.storageError = "This browser blocked storage, so your results will not be saved. Private windows often do this."; }
    this.loaded = true;
  }

  async save() {
    try { await idbSet(KEY, $state.snapshot(this.data)); this.storageError = null; }
    catch (e) { console.error(e); this.storageError = "Your last result was not saved. Check that this browser allows site storage."; }
  }

  saveEngineState(id: string, raw: string) { this.data.engineStates[id] = raw; return this.save(); }
  clearEngineState(id: string) {
    delete this.data.engineStates[id]; delete this.data.engineStates[`${id}#history`]; delete this.data.results[id]; delete this.data.outdated[id];
    return this.save();
  }
  /** Saving a result clears its own outdated flag and flags every saved result that read the previous one. */
  saveResult(id: string, result: unknown) {
    for (const d of dependantsOf(this.data.results, id)) this.data.outdated[d] = true;
    delete this.data.outdated[id];
    this.data.results[id] = result;
    return this.save();
  }
  status(id: string): ResultStatus { return resultStatus(this.data.results, this.data.outdated, id); }
  /** Read-only snapshot passed to engine.init() so tests can use each other's results as priors. */
  profileSnapshot(): Readonly<Record<string, unknown>> { return $state.snapshot(this.data.results) as Record<string, unknown>; }

  async clearAll() { this.data = empty(); await idbDelete(KEY).catch(() => {}); }
}

export const app = new AppState();
