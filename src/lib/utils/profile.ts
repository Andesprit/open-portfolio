import { marked } from 'marked';
import type { MarkdownContent, PortfolioSection } from '$lib/types/types';
import { inlineItemId } from './searchIndex';
import { shouldSortSectionByDate, sortItemsByDate } from './dateSortUtils';
import { getAbsoluteLink } from './linkUtils';

export interface ProfileItem {
	title: string;
	subtitle?: string;
	date?: string;
	html?: string;
	tags: string[];
	/** Where the matching card lives on the portfolio (detail page or home card). */
	href: string;
	/** The owner's external link, when it differs from href. */
	link?: string;
}

export interface ProfileSection {
	title: string;
	anchor: string;
	items: ProfileItem[];
}

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const tagList = (tags: unknown): string[] =>
	(Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [])
		.map(text)
		.filter(Boolean);

// One entry per card the home page shows, in the home page's order.
export function buildProfile(
	sections: PortfolioSection[],
	base: string,
	loadMarkdown: (path: string) => MarkdownContent[]
): ProfileSection[] {
	return sections.flatMap((section) => {
		if (typeof section.title !== 'string' || !section.title.trim()) return [];
		const anchor = section.title.toLowerCase().replace(/\s+/g, '-');
		let items: ProfileItem[];
		if (section.type === 'cards_outside') {
			if (!section.path) return [];
			items = loadMarkdown(section.path).map(({ slug, metadata }) => ({
				title: text(metadata.title) || slug,
				date: text(String(metadata.date ?? '')) || undefined,
				html: metadata.description ? (marked.parse(String(metadata.description), { async: false }) as string) : undefined,
				tags: tagList(metadata.tags),
				href: metadata.skip ? text(metadata.link) : `${base}/${anchor}/${encodeURIComponent(slug)}`,
				link: !metadata.skip && text(metadata.link) ? text(metadata.link) : undefined
			}));
		} else if (['cards', 'cards_with_link', 'cards_with_icons'].includes(section.type)) {
			const withIds = (section.content || []).map((item, index) => ({ ...item, id: inlineItemId(section.title, index) }));
			const sorted = section.type !== 'cards_with_icons' && shouldSortSectionByDate(section) ? sortItemsByDate(withIds) : withIds;
			items = sorted.map((item) => ({
				title: text(item.title) || text(item.name) || section.title,
				subtitle: [item.organization, item.publication].map(text).filter(Boolean).join(' · ') || undefined,
				date: text(item.date) || undefined,
				html: text(item.description) ? (marked.parse(item.description, { async: false }) as string) : undefined,
				tags: tagList(item.skills),
				href: `${base}/#${item.id}`,
				link: text(item.link) ? getAbsoluteLink(text(item.link), base) : undefined
			}));
		} else return [];
		return items.length ? [{ title: section.title, anchor, items }] : [];
	});
}
