import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Module pages for the six curriculum tracks. Entry id = `{track}/{slug}`
 * (from the file path), which is also the form `prerequisites` and `seeAlso`
 * use to reference other modules.
 */
const modules = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/modules' }),
  schema: z.object({
    track: z.enum(['math', 'systems', 'deep-learning', 'llms', 'python', 'frontier']),
    order: z.number(),
    part: z.string().optional(), // llms only
    id: z.string(), // 'M4', 'L10', 'S6' — or 'F:boytsov-efficient-llms'
    title: z.string(),
    description: z.string(),
    objectives: z.array(z.string()),
    prerequisites: z.array(z.string()).default([]),
    seeAlso: z.array(z.string()).default([]),
    notebook: z.string().url().optional(),
    colab: z.string().url().optional(),
    notebookRole: z.enum(['exercise', 'explanatory']).optional(),
    estimatedMinutes: z.number(),
    status: z.enum(['planned', 'draft', 'published']).default('planned'),
    widgets: z.array(z.string()).default([]),
    layer: z.enum(['spine', 'appendix']).default('spine'),
    updated: z.string().optional(), // modules carrying dated figures
    // frontier extension
    speaker: z.string().optional(), // key into speakers.json
    edition: z.number().optional(),
    video: z.string().url().optional(),
    segments: z
      .array(
        z.object({
          t: z.number(),
          title: z.string(),
          summary: z.string(),
          ties: z.array(z.string()).default([]),
        })
      )
      .default([]),
  }),
});

/** One record per track: identity, ordering, and the theme token that re-tints the page. */
const tracks = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/tracks' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    theme: z.enum(['default', 'purple', 'red', 'green', 'mono']),
    order: z.number(),
    prerequisiteTracks: z.array(z.string()).default([]),
  }),
});

/**
 * Compat shim: describes the five existing day pages so CourseLayout can read
 * everything from collections while the day pages still exist. Deleted at
 * cutover step 4 along with the day pages.
 */
const legacyDays = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/legacy-days' }),
  schema: z.object({
    day: z.number(),
    title: z.string(),
    notebook: z.string(), // path within the notebook repo
  }),
});

export const collections = { modules, tracks, legacyDays };
