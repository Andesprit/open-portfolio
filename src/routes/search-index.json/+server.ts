import { json } from '@sveltejs/kit';
import { base } from '$app/paths';
import portfolioData from '../../content/data/portfolio-data.json';
import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
import { buildSearchIndex } from '$lib/utils/searchIndex';

export const prerender = true;

export function GET() {
	return json(buildSearchIndex(portfolioData.sections, base, loadMarkdownFiles));
}
