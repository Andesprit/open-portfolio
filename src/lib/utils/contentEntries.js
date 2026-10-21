import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

/** @param {string} path section.path from portfolio-data.json */
export function contentDirectory(path) {
	const normalized = path.replace(/\/$/, '').replace(/^\//, '');
	return normalized.startsWith('src/') ? normalized : `src/${normalized}`;
}

/** @param {unknown} value */
const show = (value) => JSON.stringify(value instanceof Date ? value.toISOString().slice(0, 10) : value);

/**
 * Turns frontmatter into the metadata every page uses, with a warning for each value it had to replace.
 * @param {Record<string, unknown>} data
 * @param {string} source
 */
export function normalizeMetadata(data, source) {
	/** @type {string[]} */
	const warnings = [];
	/** @param {string} field @param {string} expected @param {string} fallback */
	const warn = (field, expected, fallback) =>
		warnings.push(`${source}: ${field}: ${show(data[field])} is not supported. Use ${expected}. Using ${fallback} for now.`);

	/** @param {string} field */
	function text(field) {
		const value = data[field];
		if (value === undefined || value === null || value === '') return '';
		if (typeof value === 'string') return value;
		warn(field, `quoted text, for example ${field}: "..."`, `"${String(value)}"`);
		return String(value);
	}

	/** @type {string[]} */
	let tags = [];
	if (typeof data.tags === 'string') tags = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
	else if (Array.isArray(data.tags) && data.tags.every((tag) => typeof tag === 'string' || typeof tag === 'number')) tags = data.tags.map(String);
	else if (data.tags !== undefined && data.tags !== null) {
		const scalar = typeof data.tags === 'number' || typeof data.tags === 'boolean';
		tags = scalar ? [String(data.tags)] : [];
		warn('tags', 'a comma-separated list (tags: TypeScript, Svelte) or brackets (tags: [TypeScript, Svelte])', scalar ? `the single tag "${String(data.tags)}"` : 'no tags');
	}

	let date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : '';
	if (!date) date = text('date');

	let skip = false;
	if (typeof data.skip === 'boolean') skip = data.skip;
	else if (data.skip !== undefined && data.skip !== null) warn('skip', 'true or false', 'false, so the page is shown');

	let display_order = Infinity;
	if (typeof data.display_order === 'number') display_order = data.display_order;
	else if (data.display_order !== undefined && data.display_order !== null) warn('display_order', 'a number, for example display_order: 1', 'no order (sorted by date)');

	const title = text('title');
	return {
		metadata: {
			title: data.title === undefined || data.title === null ? 'Untitled' : title,
			date,
			link: text('link'),
			tags,
			description: text('description'),
			skip,
			display_order,
			image: text('image')
		},
		warnings
	};
}

/**
 * Reads one Markdown file. Unreadable frontmatter returns `problem` instead of throwing,
 * so one broken file never hides the rest of its folder.
 * @param {string} root project root
 * @param {string} directory folder relative to root, as returned by contentDirectory
 * @param {string} file
 */
export function readContentEntry(root, directory, file) {
	const source = `${directory}/${file}`;
	const slug = basename(file, '.md');
	let parsed;
	try {
		// Passing options skips gray-matter's cache, which stores a file before parsing it,
		// so a cached broken entry would come back as empty data instead of throwing again.
		parsed = matter(readFileSync(join(root, directory, file), 'utf8'), {});
	} catch (e) {
		const error = /** @type {{ reason?: string, mark?: { line: number, column: number }, message?: string }} */ (e);
		const where = error.mark ? `line ${error.mark.line + 1}, column ${error.mark.column + 1}: ` : '';
		return {
			slug,
			source,
			problem: `${source}: the frontmatter between the --- lines could not be read (${where}${error.reason ?? error.message}). This entry is left out of the site, search and Next links until it is fixed. Check that text containing ":" or "#" is quoted, for example title: "Part 1: Setup", and that every quote is closed.`
		};
	}
	const { metadata, warnings } = normalizeMetadata(parsed.data, source);
	return { slug, source, metadata, markdown: parsed.content, warnings };
}

/**
 * Lists every Markdown entry of a content folder; the folder must exist.
 * @param {string} root
 * @param {string} directory
 */
export function readContentFolder(root, directory) {
	const results = readdirSync(join(root, directory)).filter((file) => file.endsWith('.md')).sort()
		.map((file) => readContentEntry(root, directory, file));
	return {
		entries: results.flatMap((result) => (result.metadata ? [result] : [])),
		warnings: results.flatMap((result) => result.problem ? [result.problem] : result.warnings ?? [])
	};
}
