import type { LayoutServerLoad } from './$types';
import type { PortfolioData } from '$lib/types/types';
import { loadPortfolioData } from '$lib/server/portfolioData.js';

export const load: LayoutServerLoad = async () => {
    const typedPortfolioData = loadPortfolioData() as PortfolioData;
    
    return {
        portfolioData: typedPortfolioData
    };
};
