import { readContentFolder } from './contentEntries.js';
import type { ContentReference } from '$lib/types/types';

export interface NavigationItem {
    slug: string;
    metadata: {
        title: string;
        date: string;
        link: string;
        tags: string[];
        description: string;
        skip: boolean;
        display_order: number;
    };
}

/**
 * Load all navigation items from a content directory
 * @param contentDir - The directory containing markdown files
 * @returns Array of navigation items, sorted and filtered
 */
export function loadNavigationItems(contentDir: string): NavigationItem[] {
    const allItems = readContentFolder(contentDir, '.').entries
        .map(({ slug, metadata }) => ({ slug, metadata }))
        .filter(item => !item.metadata.skip); // Filter out skipped items

    // Sort items by display_order, then by date
    allItems.sort((a, b) => {
        if (a.metadata.display_order !== b.metadata.display_order) {
            return a.metadata.display_order - b.metadata.display_order;
        }
        return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });

    return allItems;
}

/**
 * Find the next item in navigation (loops back to first if at end)
 * @param items - Array of navigation items
 * @param currentSlug - Current item slug
 * @param type - Content type for the reference
 * @returns Next item reference or undefined
 */
export function findNextItem(items: NavigationItem[], currentSlug: string, type: string): ContentReference | undefined {
    const currentIndex = items.findIndex(p => p.slug === currentSlug);
    
    // Always provide a next item - loop back to first if at the end
    if (currentIndex !== -1 && items.length > 1) {
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        return {
            slug: items[nextIndex].slug,
            title: items[nextIndex].metadata.title,
            type: type
        };
    }
    
    return undefined;
} 