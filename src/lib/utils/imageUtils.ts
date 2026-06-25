import { basename, join } from 'path';
import { existsSync, copyFileSync, mkdirSync, readFileSync } from 'fs';
import { dev } from '$app/environment';

// Read basePath from portfolio-data.json
function getBasePath(): string {
    try {
        const portfolioDataPath = join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.json');
        const portfolioData = JSON.parse(readFileSync(portfolioDataPath, 'utf-8'));
        return dev ? '' : (portfolioData.settings.basePath || '');
    } catch (e) {
        console.warn('Could not read basePath from portfolio-data.json:', e);
        return '';
    }
}

/**
 * Ensure image is copied to static folder
 * @param sourceImagePath - Source image path
 * @param staticImagePath - Target static image path
 * @param staticImageDir - Target static directory
 */
function ensureImageCopied(sourceImagePath: string, staticImagePath: string, staticImageDir: string): void {
    try {
        // Ensure static directory exists
        mkdirSync(staticImageDir, { recursive: true });
        
        // Copy image if source exists and target doesn't exist or is older
        if (existsSync(sourceImagePath)) {
            if (!existsSync(staticImagePath)) {
                copyFileSync(sourceImagePath, staticImagePath);
            }
        }
    } catch (e) {
        console.warn(`Could not copy image from ${sourceImagePath} to ${staticImagePath}:`, e);
    }
}

/**
 * Process and copy images from content directory to static folder
 * @param imagePath - The image path from markdown frontmatter
 * @param contentDir - The source content directory containing the image
 * @param sectionType - The section type for organizing static images
 * @returns The processed static URL path
 */
export function processImagePath(imagePath: string, contentDir: string, sectionType: string): string {
    if (!imagePath) return '';
    
    // If already absolute (starts with / or http), return as is
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
        return imagePath;
    }
    
    try {
        // Automatically prepend "images/" if not already present
        const imagePathWithFolder = imagePath.startsWith('images/') 
            ? imagePath 
            : `images/${imagePath}`;
        
        
        // Always ensure image is copied to static folder (for both dev and build)
        const sourceImagePath = join(contentDir, imagePathWithFolder);
        const staticImageDir = join(process.cwd(), 'static', 'content', sectionType);
        const staticImagePath = join(staticImageDir, basename(imagePath));
        
        // Ensure the image is copied
        ensureImageCopied(sourceImagePath, staticImagePath, staticImageDir);
        
        // Get the basePath for production URLs
        const basePath = getBasePath();
        
        // Return the static URL using just the filename, with basePath if in production
        const finalUrl = `${basePath}/content/${sectionType}/${basename(imagePath)}`;
        
        return finalUrl;
    } catch (e) {
        console.warn(`Could not process image ${imagePath}:`, e);
        // Fallback to original path with leading slash and basePath
        const basePath = getBasePath();
        return `${basePath}/${imagePath}`;
    }
} 