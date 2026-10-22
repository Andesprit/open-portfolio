import { error, isHttpError } from '@sveltejs/kit';
import { join } from 'path';
import type { PageServerLoad, EntryGenerator } from './$types';
import type { ContentItem, PortfolioSection } from '$lib/types/types';
import { generateRoutes, findSectionByType } from '$lib/utils/routeUtils';
import { createMarkedWithHighlight } from '$lib/utils/markdownHighlightUtils';
import { createHeadingOutline } from '$lib/utils/headingOutline';
import { loadNavigationItems, findNextItem } from '$lib/utils/navigationUtils';
import { processImagePath } from '$lib/utils/imageUtils';
import { readContentEntry } from '$lib/utils/contentEntries.js';
import { loadPortfolioData } from '$lib/server/portfolioData.js';

// Read portfolio data for route generation
const portfolioData = loadPortfolioData() as {
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

        // Read and parse the markdown file; unreadable frontmatter gets no page
        const entry = readContentEntry(process.cwd(), pathWithSrc, `${slug}.md`);
        if (!entry.metadata) throw error(404, `Content "${slug}" has unreadable frontmatter`);
        const { metadata, markdown } = entry;

        // Get all navigation items for this content type
        const navigationItems = loadNavigationItems(contentDir);
        
        // Find next item for navigation
        const nextItem = findNextItem(navigationItems, slug, type);

        // Extract section type from path for image processing (same as loadMarkdownFiles)
        const sectionType = pathWithSrc.split('/').pop() || 'default';

        // Setup marked with syntax highlighting and custom renderer
        const headings = createHeadingOutline();
        const marked = createMarkedWithHighlight(contentDir, sectionType, headings);
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
            metadata: { ...metadata, image: processedImage },
            html,
            outline: headings.outline(),
            nextItem
        } satisfies ContentItem;

    } catch (e) {
        const missingFile = e && typeof e === 'object' && 'code' in e && e.code === 'ENOENT';
        // Expected missing routes/assets are reported by prerender, without a second stack trace.
        if (!isHttpError(e, 404) && !missingFile) {
            console.error(`Error loading content for type "${params.type}" and slug "${params.slug}":`, e);
        }
        throw error(404, `Content "${params.slug}" not found in ${params.type}. Details: `);
    }
};
