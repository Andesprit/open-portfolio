import type { LayoutServerLoad } from './$types';
import type { PortfolioData } from '$lib/types/types';
import { loadPortfolioData } from '$lib/server/portfolioData.js';
import { dev } from '$app/environment';
import { readPortfolioWarnings } from '$lib/server/portfolioValidation.js';

export const load: LayoutServerLoad = async () => {
    const typedPortfolioData = loadPortfolioData() as PortfolioData;
    
    return {
        portfolioData: typedPortfolioData,
        ...(dev ? { configWarnings: readPortfolioWarnings(process.cwd()) } : {})
    };
};
