import { base } from '$app/paths';
import type { PageServerLoad } from './$types';
import portfolioData from '../../content/data/portfolio-data.json';
import type { PortfolioSection } from '$lib/types/types';
import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
import { buildProfile } from '$lib/utils/profile';

export const prerender = true;

export const load: PageServerLoad = () => ({
	profile: buildProfile(portfolioData.sections as PortfolioSection[], base, loadMarkdownFiles)
});
