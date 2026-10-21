import type { MarkdownContent, PortfolioSection } from '$lib/types/types';
import type { Passage } from './headingOutline';

export interface SearchEntry {
	title: string;
	section: string;
	text: string;
	tags: string[];
	href: string;
	targetId?: string;
	passages?: Passage[];
	/** Set on results that matched inside an article: the section heading and the words around the match. */
	heading?: string;
	excerpt?: string;
}

export function inlineItemId(sectionTitle: string, originalIndex: number): string {
	return `${sectionTitle.toLowerCase().replace(/\s+/g, '-')}--item-${originalIndex + 1}`;
}

function plainText(value: unknown): string {
	return typeof value === 'string'
		? value
				.replace(/<[^>]*>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim()
		: '';
}

export function buildSearchIndex(
	sections: PortfolioSection[],
	base: string,
	loadMarkdown: (path: string) => MarkdownContent[],
	loadPassages: (path: string, slug: string) => Passage[] = () => []
): SearchEntry[] {
	const entries: SearchEntry[] = [];
	for (const section of sections) {
		if (
			typeof section.title !== 'string' ||
			!section.title.trim() ||
			!['cards', 'cards_with_link', 'cards_with_icons', 'cards_outside'].includes(section.type)
		)
			continue;
		const anchor = section.title.toLowerCase().replace(/\s+/g, '-');
		const sectionHref = `${base}/#${anchor}`;
		entries.push({
			title: section.title,
			section: section.title,
			text: '',
			tags: [],
			href: sectionHref
		});
		if (section.type === 'cards_outside' && section.path) {
			for (const item of loadMarkdown(section.path)) {
				if (item.metadata.skip) continue;
				const tags = item.metadata.tags;
				entries.push({
					title: item.metadata.title,
					section: section.title,
					text: plainText(item.metadata.description),
					tags: Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim()),
					href: `${base}/${anchor}/${encodeURIComponent(item.slug)}`,
					passages: loadPassages(section.path, item.slug)
				});
			}
		} else {
			for (const [index, item] of (section.content || []).entries()) {
				if (item.skip) continue;
				const targetId = inlineItemId(section.title, index);
				entries.push({
					title: plainText(item.title || item.name) || section.title,
					section: section.title,
					text: [
						item.organization,
						item.publication,
						item.description,
						...(Array.isArray(item.skills) ? item.skills : [])
					]
						.map(plainText)
						.filter(Boolean)
						.join(' '),
					tags: Array.isArray(item.skills)
						? item.skills.filter((skill): skill is string => typeof skill === 'string')
						: [],
					href: `${base}/#${targetId}`,
					targetId
				});
			}
		}
	}
	return entries;
}

function excerpt(text: string, word: string): string {
	const at = Math.max(0, text.toLowerCase().indexOf(word));
	const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, at - 60)) + 1);
	const end = text.indexOf(' ', at + 100);
	return `${start > 0 ? '… ' : ''}${text.slice(start, end < 0 ? undefined : end)}${end < 0 ? '' : ' …'}`;
}

// An article that does not match as a whole gives one result: its best section, preferring heading matches.
export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
	const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	const matches = (...parts: string[]) => {
		const text = parts.join(' ').toLowerCase();
		return words.every((word) => text.includes(word));
	};
	return entries.flatMap((entry) => {
		if (matches(entry.title, entry.section, entry.text, ...entry.tags)) return [entry];
		const passages = (entry.passages || []).filter((passage) =>
			matches(entry.title, passage.heading || '', passage.text)
		);
		const best =
			passages.find((passage) => matches(entry.title, passage.heading || '')) || passages[0];
		if (!best) return [];
		const word = words.find((w) => best.text.toLowerCase().includes(w));
		return [
			{
				...entry,
				href: best.id ? `${entry.href}#${best.id}` : entry.href,
				heading: best.heading,
				excerpt: word ? excerpt(best.text, word) : best.text.slice(0, 160)
			}
		];
	});
}
