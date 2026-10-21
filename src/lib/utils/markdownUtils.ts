import { marked } from 'marked';
import { join } from 'path';
import { readContentFolder } from './contentEntries.js';
import { processImagePath } from './imageUtils';
import { sortByOrderAndDate } from './dateSortUtils';
import type { MarkdownContent } from '$lib/types/types';

/**
 * Load and process markdown files from a directory
 * @param directory - The directory path containing markdown files
 * @returns Array of processed markdown content
 */
export function loadMarkdownFiles(directory: string): MarkdownContent[] {
    try {
        // Normalize the path to always include src and remove any trailing slashes
        const normalizedPath = directory
            .replace(/\/$/, '')  // remove trailing slash
            .replace(/^\//, ''); // remove leading slash

        // Ensure path starts with src/
        const pathWithSrc = normalizedPath.startsWith('src/') 
            ? normalizedPath 
            : `src/${normalizedPath}`;
        
        const fullPath = join(process.cwd(), pathWithSrc);
        
        // Extract section type from path for image processing
        const sectionType = pathWithSrc.split('/').pop() || 'default';
        
        const { entries } = readContentFolder(process.cwd(), pathWithSrc);
        const content = entries.map(({ slug, metadata, markdown }) => {
            const html = marked.parse(markdown) as string;
            
            // Safely process image with error handling
            let processedImage = '';
            if (metadata.image) {
                try {
                    processedImage = processImagePath(metadata.image, fullPath, sectionType);
                } catch (imageError) {
                    console.warn(`Warning: Could not process image "${metadata.image}" for ${slug}:`, imageError);
                    // Fallback to empty string - this will prevent the image from showing but won't break the section
                    processedImage = '';
                }
            }
            
            return { slug, metadata: { ...metadata, image: processedImage }, html };
        });
        
        // Sort by order and date
        content.sort(sortByOrderAndDate);
        
        return content;
    } catch (e) {
        // The config validator already names missing folders and their JSON locations.
        if (e && typeof e === 'object' && 'code' in e && 'syscall' in e && e.syscall === 'scandir' && ['ENOENT', 'ENOTDIR'].includes(String(e.code))) return [];
        console.warn(`Warning: Could not load files from directory ${directory}:`, e);
        return [];
    }
}

/**
 * Calculate tag frequencies and get all tags sorted by frequency
 * @param items - Array of items with metadata containing tags
 * @returns Array of tags sorted by frequency (most frequent first)
 */
export function getTagsByFrequency(items: Array<{ metadata: { tags?: string[] | string } }>): string[] {
    const tagFrequency: { [key: string]: number } = {};
    items.forEach(item => {
        const tags = item.metadata.tags || [];
        (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()))
            .forEach((tag: string) => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
    });
    return Object.entries(tagFrequency)
        .sort(([,a], [,b]) => b - a)
        .map(([tag]) => tag);
}
