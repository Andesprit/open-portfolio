import { json } from '@sveltejs/kit';
import { base } from '$app/paths';
import { loadPortfolioData } from '$lib/server/portfolioData.js';
import type { PortfolioData } from '$lib/types/types';
import { loadMarkdownFiles } from '$lib/utils/markdownUtils';
import { buildSearchIndex } from '$lib/utils/searchIndex';
import { articlePassages } from '$lib/utils/headingOutline';
import { contentDirectory, readContentEntry } from '$lib/utils/contentEntries.js';

export const prerender = true;

export function GET() {
	return json(
		buildSearchIndex((loadPortfolioData() as PortfolioData).sections, base, loadMarkdownFiles, (path, slug) => {
			const entry = readContentEntry(process.cwd(), contentDirectory(path), `${slug}.md`);
			return entry.markdown ? articlePassages(entry.markdown) : [];
		})
	);
}
