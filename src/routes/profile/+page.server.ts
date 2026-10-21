import { base } from '$app/paths';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';
import portfolioData from '../../content/data/portfolio-data.json';
import type { PortfolioSection } from '$lib/types/types';
import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
import { buildProfile } from '$lib/utils/profile';

export const prerender = true;

export const load: PageServerLoad = () => ({
	bio: portfolioData.settings.bio ? (marked.parse(portfolioData.settings.bio, { async: false }) as string) : '',
	profile: buildProfile(portfolioData.sections as PortfolioSection[], base, loadMarkdownFiles)
});
