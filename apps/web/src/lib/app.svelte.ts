// App state (Svelte 5 runes) persisted to IndexedDB. Private mode: nothing is uploaded.
import { idbDelete, idbGet, idbSet } from "./db.ts";

interface Saved {
  v: 2;
  /** Serialized engine state so a test can be resumed. */
  engineStates: Record<string, string>;
  /** Finished test results, read only as optional priors by other tests. */
  results: Record<string, unknown>;
}
const KEY = "session";
const empty = (): Saved => ({ v: 2, engineStates: {}, results: {} });
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
      if (s?.v === 2) { const { engineStates = {}, results = {} } = s as Saved; this.data = { v: 2, engineStates: strings(engineStates), results: objects(results) }; } // older saves may carry a bio: dropped
      else if (s) this.data = { ...empty(), engineStates: (s.engineStates as Record<string, string>) ?? {} }; // v1 → v2
    } catch (e) { console.error(e); this.storageError = "This browser blocked storage, so your results will not be saved. Private windows often do this."; }
    this.loaded = true;
  }

  async save() {
    try { await idbSet(KEY, $state.snapshot(this.data)); this.storageError = null; }
    catch (e) { console.error(e); this.storageError = "Your last result was not saved. Check that this browser allows site storage."; }
  }

  saveEngineState(id: string, raw: string) { this.data.engineStates[id] = raw; return this.save(); }
  clearEngineState(id: string) {
    delete this.data.engineStates[id]; delete this.data.engineStates[`${id}#history`]; delete this.data.results[id];
    return this.save();
  }
  saveResult(id: string, result: unknown) { this.data.results[id] = result; return this.save(); }
  /** Read-only snapshot passed to engine.init() so tests can use each other's results as priors. */
  profileSnapshot(): Readonly<Record<string, unknown>> { return $state.snapshot(this.data.results) as Record<string, unknown>; }

  async clearAll() { this.data = empty(); await idbDelete(KEY).catch(() => {}); }
}

export const app = new AppState();
