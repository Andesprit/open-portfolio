import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PageData, PortfolioSection } from '$lib/types/types';
import { processContentSections } from '$lib/utils/contentUtils';
import { loadPortfolioData } from '$lib/server/portfolioData.js';

const portfolioData = loadPortfolioData();

export const prerender = true;

export const load: PageServerLoad = async () => {
    try {
        // Get all sections with configured content paths
        const markdownSections = (portfolioData.sections as PortfolioSection[]).filter((section): section is PortfolioSection & { path: string } => Boolean(section.path));

        // Load content for each section
        const contentBySection = processContentSections(markdownSections);

        const result: PageData = {
            content: contentBySection
        };

        return result;

    } catch (e) {
        console.error('Error loading main page content during prerender:', e);
        throw error(500, 'Failed to load portfolio content during prerender');
    }
};
