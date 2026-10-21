// Plain JS so svelte.config.js can share the card id rules with the components.

/** @param {string} sectionTitle @param {number} originalIndex */
export function inlineItemId(sectionTitle, originalIndex) {
	return `${sectionTitle.toLowerCase().replace(/\s+/g, '-')}--item-${originalIndex + 1}`;
}

/**
 * Ids of every inline card the home page renders, including cards on later pagination pages.
 * @param {Array<{ title?: unknown, type?: unknown, content?: unknown }>} sections
 */
export function inlineCardIds(sections) {
	const ids = new Set();
	for (const section of sections || []) {
		if (typeof section.title !== 'string' || !section.title.trim()) continue;
		if (!['cards', 'cards_with_link', 'cards_with_icons'].includes(String(section.type))) continue;
		if (!Array.isArray(section.content)) continue;
		for (let index = 0; index < section.content.length; index++) ids.add(inlineItemId(section.title, index));
	}
	return ids;
}
