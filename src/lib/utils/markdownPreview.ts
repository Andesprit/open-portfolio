import { marked } from 'marked';

// Tokenize rendered HTML so a character limit never cuts an entity or an HTML tag.
const htmlTokens = /<!--[\s\S]*?-->|<(?:"[^"]*"|'[^']*'|[^'">])*?>|&(?:#\d+|#x[\da-f]+|[a-z][\da-z]*);|[\s\S]/giu;
const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function markdownPreview(text: string, limit: number): { html: string; truncated: boolean } {
	const html = marked.parse(text || '', { async: false }).trimEnd();
	const tokens = html.match(htmlTokens) || [];
	const textLength = tokens.filter((token) => !token.startsWith('<')).length;
	if (textLength <= limit) return { html, truncated: false };

	let preview = '';
	let characters = 0;
	const openTags: string[] = [];
	for (const token of tokens) {
		if (token.startsWith('<')) {
			const tag = /^<(\/)?([a-z][\w:-]*)\b/i.exec(token);
			if (tag) {
				const name = tag[2].toLowerCase();
				if (tag[1]) {
					const index = openTags.lastIndexOf(name);
					if (index !== -1) openTags.splice(index);
				} else if (!voidElements.has(name) && !token.endsWith('/>')) {
					openTags.push(name);
				}
			}
		} else {
			if (characters >= Math.max(0, limit)) break;
			characters++;
		}
		preview += token;
	}
	return { html: `${preview}...${openTags.reverse().map((tag) => `</${tag}>`).join('')}`, truncated: true };
}
