import { error } from '@sveltejs/kit';
import matter from 'gray-matter';
import { join } from 'path';
import { readFileSync } from 'fs';
import type { PageServerLoad, EntryGenerator } from './$types';
import type { ContentItem, PortfolioSection } from '$lib/types/types';
import { generateRoutes, findSectionByType } from '$lib/utils/routeUtils';
import { createMarkedWithHighlight } from '$lib/utils/markdownHighlightUtils';
import { loadNavigationItems, findNextItem } from '$lib/utils/navigationUtils';
import { processImagePath } from '$lib/utils/imageUtils';

// Read portfolio data for route generation
const portfolioData = JSON.parse(readFileSync(join(process.cwd(), 'src', 'content', 'data', 'portfolio-data.json'), 'utf-8')) as {
    sections: PortfolioSection[];
};

export const prerender = true;

// Generate all possible routes
export const entries: EntryGenerator = () => {
    return generateRoutes(portfolioData);
};

export const load: PageServerLoad = async ({ params }) => {
    try {
        const { type, slug } = params;
        
        // Find the section configuration from portfolio data
        const section = findSectionByType(portfolioData, type);

        if (!section) {
            throw error(404, `Content type "${type}" not found`);
        }

        // Use the same path normalization as in loadMarkdownFiles
        const normalizedPath = section.path
            .replace(/\/$/, '')  // remove trailing slash
            .replace(/^\//, ''); // remove leading slash

        // Ensure path starts with src/ (same as loadMarkdownFiles)
        const pathWithSrc = normalizedPath.startsWith('src/') 
            ? normalizedPath 
            : `src/${normalizedPath}`;

        const contentDir = join(process.cwd(), pathWithSrc);
        const fullPath = join(contentDir, `${slug}.md`);

        // Read and parse the markdown file
        const raw = readFileSync(fullPath, 'utf-8');
        const { data: metadata, content: markdown } = matter(raw);

        // Get all navigation items for this content type
        const navigationItems = loadNavigationItems(contentDir);
        
        // Find next item for navigation
        const nextItem = findNextItem(navigationItems, slug, type);

        // Extract section type from path for image processing (same as loadMarkdownFiles)
        const sectionType = pathWithSrc.split('/').pop() || 'default';

        // Setup marked with syntax highlighting and custom renderer
        const marked = createMarkedWithHighlight(contentDir, sectionType);
        const html = await marked.parse(markdown);
        
        // Safely process image with error handling
        let processedImage = '';
        if (metadata.image) {
            try {
                processedImage = processImagePath(metadata.image, contentDir, sectionType);
            } catch (imageError) {
                console.warn(`Warning: Could not process image "${metadata.image}" for ${slug}:`, imageError);
                // Fallback to empty string - this will prevent the image from showing but won't break the page
                processedImage = '';
            }
        }
        
        // Return the content with metadata and next project
        return {
            slug,
            type,
            metadata: {
                title: metadata.title ?? 'Untitled',
                date: metadata.date || '',
                link: metadata.link || '',
                tags: Array.isArray(metadata.tags) ? metadata.tags : metadata.tags?.split(',').map((t: string) => t.trim()) || [],
                description: metadata.description || '',
                skip: metadata.skip || false,
                display_order: typeof metadata.display_order === 'number' ? metadata.display_order : Infinity,
                image: processedImage
            },
            html,
            nextItem
        } satisfies ContentItem;

    } catch (e) {
        console.error(`Error loading content for type "${params.type}" and slug "${params.slug}":`, e);
        throw error(404, `Content "${params.slug}" not found in ${params.type}. Details: `);
    }
};