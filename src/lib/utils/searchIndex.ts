import type { MarkdownContent, PortfolioSection } from '$lib/types/types';

export interface SearchEntry {
	title: string;
	section: string;
	text: string;
	tags: string[];
	href: string;
	targetId?: string;
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
	loadMarkdown: (path: string) => MarkdownContent[]
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
					text: plainText(item.metadata.description || item.html),
					tags: Array.isArray(tags) ? tags : tags.split(',').map((tag) => tag.trim()),
					href: `${base}/${anchor}/${encodeURIComponent(item.slug)}`
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

export function searchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
	const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	return entries.filter((entry) => {
		const text = [entry.title, entry.section, entry.text, ...entry.tags].join(' ').toLowerCase();
		return words.every((word) => text.includes(word));
	});
}
