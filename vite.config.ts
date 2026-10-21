import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { readPortfolioWarnings } from './src/lib/server/portfolioValidation.js';

function validatePortfolioConfig() {
    let root = process.cwd();
    let hadWarnings = false;
    function report(warnings: string[]) {
        if (warnings.length) {
            fs.writeSync(2, `\nportfolio-data.json: ${warnings.length} configuration warning(s) (build continues):\n${warnings.map(warning => `  - ${warning}`).join('\n')}\n\n`);
        } else if (hadWarnings) {
            fs.writeSync(2, 'portfolio-data.json: configuration warnings cleared.\n');
        }
        hadWarnings = warnings.length > 0;
    }
    return {
        name: 'validate-portfolio-config',
        configResolved(config: import('vite').ResolvedConfig) {
            // SvelteKit starts a second build for SSR; report only once at startup.
            if (config.build.ssr) return;
            root = config.root;
            report(readPortfolioWarnings(root));
        },
        async handleHotUpdate(context: import('vite').HmrContext) {
            const markdown = context.file.startsWith(path.join(root, 'src/content') + path.sep) && context.file.endsWith('.md');
            if (context.file !== path.join(root, 'src/content/data/portfolio-data.json') && !markdown) return;
            // Vite waits for editors to finish writing before returning the new content.
            await context.read();
            report(readPortfolioWarnings(root));
            for (const module of context.modules) context.server.moduleGraph.invalidateModule(module);
            context.server.ws.send({ type: 'full-reload' });
            return [];
        }
    };
}

// Plugin to copy content images to static folder during build
function copyContentImages() {
    return {
        name: 'copy-content-images',
        configResolved() {
            const contentDir = path.join(process.cwd(), 'src', 'content');
            const staticDir = path.join(process.cwd(), 'static', 'content');
            
            // Ensure static/content directory exists
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }
            
            // Find all subdirectories in content
            const contentSubDirs = fs.readdirSync(contentDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory() && dirent.name !== 'data')
                .map(dirent => dirent.name);
            
            contentSubDirs.forEach(subDir => {
                const sourceImagesDir = path.join(contentDir, subDir, 'images');
                const targetImagesDir = path.join(staticDir, subDir);
                
                if (fs.existsSync(sourceImagesDir)) {
                    // Ensure target directory exists
                    if (!fs.existsSync(targetImagesDir)) {
                        fs.mkdirSync(targetImagesDir, { recursive: true });
                    }
                    
                    // Copy all images
                    const imageFiles = fs.readdirSync(sourceImagesDir);
                    imageFiles.forEach(imageFile => {
                        const sourcePath = path.join(sourceImagesDir, imageFile);
                        const targetPath = path.join(targetImagesDir, imageFile);
                        
                        if (fs.statSync(sourcePath).isFile()) {
                            fs.copyFileSync(sourcePath, targetPath);
                        }
                    });
                }
            });
        }
    };
}

export default defineConfig({
    plugins: [copyContentImages(), validatePortfolioConfig(), sveltekit()],
    resolve: {
        alias: {
            
        }
    },

    assetsInclude: ['**/*.md','**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
});
