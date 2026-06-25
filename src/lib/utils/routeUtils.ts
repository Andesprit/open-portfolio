import { basename, join } from 'path';
import { readFileSync, readdirSync, existsSync } from 'fs';
import type { PortfolioSection } from '$lib/types/types';

/**
 * Generate all possible routes from portfolio sections
 * @param portfolioData - The portfolio data containing sections
 * @returns Array of route objects with type and slug
 */
export function generateRoutes(portfolioData: { sections: PortfolioSection[] }): Array<{ type: string; slug: string }> {
    const routes: Array<{ type: string; slug: string }> = [];
    
    // Get sections with valid paths
    const sectionsWithPaths = portfolioData.sections.filter(
        (section): section is PortfolioSection & { path: string } => 
            typeof section.path === 'string' && 
            section.path.trim() !== ''
    );

    // Process each section
    sectionsWithPaths.forEach((section) => {
        try {
            const normalizedPath = section.path.replace(/\/$/, '').replace(/^\//, '');
            const fullPath = join(process.cwd(), normalizedPath);
            
            // Verify directory exists
            if (!existsSync(fullPath)) {
                console.warn(`Warning: Directory not found for ${section.title}: ${fullPath}`);
                return;
            }

            const files = readdirSync(fullPath).filter((file: string) => file.endsWith('.md'));
            
            // Use a normalized section type for routes
            const routeType = section.title.toLowerCase().replace(/\s+/g, '-');
            
            files.forEach((file: string) => {
                routes.push({
                    type: routeType,
                    slug: basename(file, '.md')
                });
            });
        } catch (e: unknown) {
            const error = e instanceof Error ? e.message : String(e);
            console.warn(`Warning: Could not generate routes for ${section.title}:`, error);
        }
    });
    
    return routes;
}

/**
 * Find a section configuration by route type
 * @param portfolioData - The portfolio data containing sections
 * @param type - The route type to find
 * @returns The matching section or undefined
 */
export function findSectionByType(portfolioData: { sections: PortfolioSection[] }, type: string): (PortfolioSection & { path: string }) | undefined {
    return portfolioData.sections.find(
        (s): s is PortfolioSection & { path: string } => 
            typeof s.path === 'string' && 
            s.title.toLowerCase().replace(/\s+/g, '-') === type
    );
} 