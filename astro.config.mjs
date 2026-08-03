import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  // For GitHub Pages with a custom domain (llmsforsocialscience.net):
  site: 'https://llmsforsocialscience.net',

  // If deploying to a GitHub repo WITHOUT a custom domain, uncomment:
  // base: '/repo-name',

  build: {
    assets: '_assets',
  },
});
