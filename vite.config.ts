import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { validatePortfolio } from './src/lib/utils/validatePortfolio.js';

function validatePortfolioConfig() {
    return {
        name: 'validate-portfolio-config',
        configResolved(config: import('vite').ResolvedConfig) {
            // SvelteKit starts a second build for SSR; report only once at startup.
            if (config.build.ssr) return;
            const data = JSON.parse(fs.readFileSync(path.join(config.root, 'src/content/data/portfolio-data.json'), 'utf8'));
            const warnings = validatePortfolio(data);
            if (warnings.length) {
                fs.writeSync(2, `\nportfolio-data.json: ${warnings.length} configuration warning(s) (build continues):\n${warnings.map(warning => `  - ${warning}`).join('\n')}\n\n`);
            }
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
    plugins: [validatePortfolioConfig(), copyContentImages(), sveltekit()],
    resolve: {
        alias: {
            
        }
    },

    assetsInclude: ['**/*.md','**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
});
