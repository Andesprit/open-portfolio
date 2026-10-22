import { base } from '$app/paths';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';
import { loadPortfolioData } from '$lib/server/portfolioData.js';
import type { PortfolioData, PortfolioSection } from '$lib/types/types';
import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
import { buildProfile } from '$lib/utils/profile';

export const prerender = true;

export const load: PageServerLoad = () => {
	const portfolioData = loadPortfolioData() as PortfolioData;
	return {
		bio: portfolioData.settings.bio ? (marked.parse(portfolioData.settings.bio, { async: false }) as string) : '',
		profile: buildProfile(portfolioData.sections as PortfolioSection[], base, loadMarkdownFiles)
	};
};
