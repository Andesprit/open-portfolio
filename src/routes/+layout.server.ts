import type { LayoutServerLoad } from './$types';
import type { PortfolioData } from '$lib/types/types';
import portfolioData from '../content/data/portfolio-data.json';
import { dev } from '$app/environment';
import { readPortfolioWarnings } from '$lib/server/portfolioValidation.js';

export const load: LayoutServerLoad = async () => {
    const typedPortfolioData = portfolioData as PortfolioData;
    
    return {
        portfolioData: typedPortfolioData,
        ...(dev ? { configWarnings: readPortfolioWarnings(process.cwd()) } : {})
    };
};
