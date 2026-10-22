import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
import { inlineCardIds } from './src/lib/utils/cardIds.js';
import { loadPortfolioData } from './src/lib/server/portfolioData.js';

let portfolioData;
try {
    portfolioData = loadPortfolioData();
} catch (error) {
    console.error('Error reading portfolio-data.yaml:', error);
    portfolioData = { settings: { basePath: '' } };
}
/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            precompress: false,
            strict: true
        }),

        prerender: {
            // Legacy portfolios can also contain navigation to an unrendered section.
            handleMissingId: ({ path: pagePath, id, message }) => {
                const base = process.env.NODE_ENV === 'production' ? portfolioData.settings.basePath : '';
                // Cards on later pagination pages are not in the prerendered home HTML; the page reveals them on load.
                if (pagePath === `${base}/` && inlineCardIds(portfolioData.sections).has(id)) return;
                fs.writeSync(2, `${message}\n`);
            },
            handleHttpError: ({ status, path: missingPath, referrer, message }) => {
                const base = process.env.NODE_ENV === 'production' ? portfolioData.settings.basePath : '';
                const file = missingPath.startsWith(`${base}/`)
                    ? missingPath.slice(base.length + 1)
                    : missingPath.replace(/^\//, '');
                const extension = path.posix.extname(file).toLowerCase();
                // Missing owner assets should not prevent an otherwise working portfolio from building.
                if (status === 404 && extension && !['.html', '.htm'].includes(extension)) {
                    // Flush before SvelteKit terminates the prerender worker.
                    fs.writeSync(2, `Missing file "${missingPath}" linked from "${referrer || '(unknown page)'}". Add it at "static/${file}" or update its path in portfolio-data.yaml.\n`);
                    return;
                }
                throw new Error(message);
            }
        },

        alias: {
            $components: './src/components',
            $lib: './src/lib',
            $utils: './src/utils',
            $routes: './src/routes',
            $content: './src/content',
        },

        paths: {
            // A static 404 is served at arbitrary depths, so its assets and home link must be rooted.
            relative: false,
            // Apply '/your-repo-name' only when building for production (npm run build)
            // Use an empty string '' for local development (npm run dev)
            base: process.env.NODE_ENV === 'production' ? portfolioData.settings.basePath : '',
        }
    }
};

export default config;
