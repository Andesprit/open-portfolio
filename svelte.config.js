import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
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
            fallback: '404.html',
            precompress: false,
            strict: true
        }),

        alias: {
            $components: './src/components',
            $lib: './src/lib',
            $utils: './src/utils',
            $routes: './src/routes',
            $content: './src/content',
        },

        paths: {
            // Apply '/your-repo-name' only when building for production (npm run build)
            // Use an empty string '' for local development (npm run dev)
            base: process.env.NODE_ENV === 'production' ? portfolioData.settings.basePath : '',
        }
    }
};

export default config;
