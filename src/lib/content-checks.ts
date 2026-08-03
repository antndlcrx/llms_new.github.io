import type { CollectionEntry } from 'astro:content';

/**
 * Every widget id the curriculum knows about — the 21 live on the day pages
 * plus the 26 specified in the blueprint widget catalogue (03-widget-catalogue.md
 * on the curriculum-blueprint branch). A module frontmatter `widgets` entry
 * outside this list fails the build.
 */
export const WIDGET_REGISTRY = new Set([
  // live on the current day pages
  'cosine-explorer',
  'proj-explorer',
  'bpe-explorer',
  'attn-stepper',
  'mh-explorer',
  'cost-calc',
  'preference-explorer-root',
  'prompt-anatomy-root',
  'temperature-viz-root',
  'prompt-sensitivity-root',
  'test-time-compute-root',
  'model-explorer',
  'lora-widget',
  'ce-widget',
  'cm-widget',
  'vs-widget',
  'faithfulness-failures-root',
  'rag-pipeline-root',
  'chunking-visualiser-root',
  'react-loop-root',
  'failure-modes-root',
  // specified for the math track
  'vector-playground',
  'dimension-stepper',
  'matrix-transform-canvas',
  'projection-sandbox',
  'rank-slider',
  'chain-rule-stepper',
  'descent-landscape',
  'softmax-explorer',
  'entropy-coder',
  // specified for the systems track
  'byte-inspector',
  'float-dissector',
  'latency-ladder',
  'roofline-plotter',
  'quantisation-simulator',
  'parallelism-layout',
  'serving-simulator',
  // specified for the deep-learning track
  'overfitting-explorer',
  'decision-boundary',
  'network-shape-playground',
  'backprop-stepper',
  'training-dynamics',
  'vanishing-gradient',
  // specified for the llms track re-cut
  'tfidf-explorer',
  'lda-explorer',
  'weat-calculator',
  'contextual-vs-static',
  'scaling-law-plotter',
]);

/**
 * Build-time integrity checks mandated by the architecture: every
 * prerequisites/seeAlso entry resolves to a real module record, the
 * prerequisite graph is acyclic, and every widget id is in the catalogue.
 * Throws (failing the build) with all violations listed at once.
 */
export function assertContentIntegrity(modules: CollectionEntry<'modules'>[]): void {
  const ids = new Set(modules.map((m) => m.id));
  const problems: string[] = [];

  for (const m of modules) {
    for (const p of m.data.prerequisites) {
      if (!ids.has(p)) problems.push(`${m.id}: prerequisite "${p}" does not resolve to a module`);
    }
    for (const s of m.data.seeAlso) {
      if (!ids.has(s)) problems.push(`${m.id}: seeAlso "${s}" does not resolve to a module`);
    }
    for (const w of m.data.widgets) {
      if (!WIDGET_REGISTRY.has(w)) problems.push(`${m.id}: widget "${w}" is not in the catalogue registry`);
    }
  }

  // Cycle detection over the prerequisite graph (DFS, three colours).
  const prereqs = new Map(modules.map((m) => [m.id, m.data.prerequisites.filter((p) => ids.has(p))]));
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      problems.push(`prerequisite cycle: ${[...path, id].join(' → ')}`);
      return;
    }
    state.set(id, 'visiting');
    for (const p of prereqs.get(id) ?? []) visit(p, [...path, id]);
    state.set(id, 'done');
  };
  for (const id of ids) visit(id, []);

  if (problems.length > 0) {
    throw new Error(`Content integrity checks failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  }
}
