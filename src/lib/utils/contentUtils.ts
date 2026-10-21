import type { PortfolioSection, ContentSection } from '$lib/types/types';
import { loadMarkdownFiles, getTagsByFrequency } from './markdownUtils';

/**
 * Process markdown sections and build content by section
 * @param markdownSections - Array of portfolio sections with paths
 * @returns Record mapping section titles to their content and tags
 */
export function processContentSections(markdownSections: (PortfolioSection & { path: string })[]): Record<string, ContentSection> {
    return markdownSections.reduce<Record<string, ContentSection>>((acc, section) => {
        // Invalid titles are reported by the config validator; keep the remaining sections usable.
        if (typeof section.title !== 'string' || !section.title.trim()) return acc;
        const content = loadMarkdownFiles(section.path);
        
        // Calculate tags for this section
        const tags = getTagsByFrequency(content);
        
        acc[section.title.toLowerCase()] = {
            content,
            tags
        };
        return acc;
    }, {});
} 
