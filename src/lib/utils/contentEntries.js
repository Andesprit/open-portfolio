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
 * @param {unknown} root parsed frontmatter
 * @param {string} source
 */
export function normalizeMetadata(root, source) {
	/** @type {string[]} */
	const warnings = [];
	const isObject = root !== null && typeof root === 'object' && !Array.isArray(root) && !(root instanceof Date);
	if (!isObject) {
		warnings.push(`${source}: the frontmatter is ${show(root)}, not a list of fields. Write one "field: value" per line between the --- lines, for example title: "My post". Using no metadata for now.`);
	}
	const data = isObject ? /** @type {Record<string, unknown>} */ (root) : {};
	/** @param {string} field @param {string} expected @param {string} fallback */
	const warn = (field, expected, fallback) =>
		warnings.push(`${source}: ${field}: ${show(data[field])} is not supported. Use ${expected}. Using ${fallback} for now.`);
	/** @param {unknown} value */
	const missing = (value) => value === undefined || value === null || value === '';

	// Numbers and booleans read as the text the owner typed; objects and lists have no sensible text.
	/** @param {string} field @param {string} fallback */
	function text(field, fallback = '') {
		const value = data[field];
		if (missing(value)) return fallback;
		if (typeof value === 'string') return value;
		const scalar = typeof value === 'number' || typeof value === 'boolean';
		warn(field, `quoted text, for example ${field}: "..."`, scalar ? `"${String(value)}"` : fallback ? `"${fallback}"` : 'nothing');
		return scalar ? String(value) : fallback;
	}

	// A destination must be exactly what the owner wrote, or nothing: never a guessed URL.
	/** @param {string} field @param {string} example */
	function destination(field, example) {
		const value = data[field];
		if (missing(value)) return '';
		if (typeof value === 'string') return value;
		warn(field, `a quoted path or URL, for example ${field}: "${example}"`, `no ${field}`);
		return '';
	}

	const tagForm = 'a comma-separated list (tags: TypeScript, Svelte) or brackets (tags: [TypeScript, Svelte])';
	/** @type {string[]} */
	let tags = [];
	if (typeof data.tags === 'string') tags = data.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
	else if (Array.isArray(data.tags)) {
		const kept = data.tags.filter((tag) => typeof tag === 'string' || typeof tag === 'number');
		tags = kept.map(String).map((tag) => tag.trim()).filter(Boolean);
		if (kept.length !== data.tags.length || kept.some((tag) => typeof tag === 'number')) {
			warn('tags', `${tagForm} with plain words`, tags.length ? `the tags ${tags.map((tag) => `"${tag}"`).join(', ')}` : 'no tags');
		}
	} else if (!missing(data.tags)) {
		const scalar = typeof data.tags === 'number' || typeof data.tags === 'boolean';
		tags = scalar ? [String(data.tags)] : [];
		warn('tags', tagForm, scalar ? `the single tag "${String(data.tags)}"` : 'no tags');
	}

	// YAML turns an unquoted 2024-12-20 into a Date; keep that day as written, and keep the
	// full instant of a timestamp so same-day posts still sort newest first.
	const iso = data.date instanceof Date && !isNaN(data.date.getTime()) ? data.date.toISOString() : '';
	const date = iso ? iso.replace(/T00:00:00\.000Z$/, '') : text('date');
	const link = destination('link', 'https://github.com/you/project');

	let skip = false;
	if (typeof data.skip === 'boolean') skip = data.skip;
	else if (!missing(data.skip)) warn('skip', 'true or false', 'false, so the page is shown');
	if (skip && !link) {
		warnings.push(`${source}: skip: true sends visitors to link, but there is no usable link. Add link: "https://..." or set skip: false. Showing the page for now.`);
		skip = false;
	}

	let display_order = Infinity;
	if (typeof data.display_order === 'number' && Number.isFinite(data.display_order)) display_order = data.display_order;
	else if (!missing(data.display_order)) warn('display_order', 'a number, for example display_order: 1', 'no order (sorted by date)');

	return {
		metadata: {
			title: text('title', 'Untitled'),
			date,
			link,
			tags,
			description: text('description'),
			skip,
			display_order,
			image: destination('image', 'images/cover.png')
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
	let raw;
	try {
		raw = readFileSync(join(root, directory, file), 'utf8');
	} catch (e) {
		const code = /** @type {{ code?: string }} */ (e).code ?? String(e);
		return {
			slug,
			source,
			problem: `${source}: the file could not be opened (${code}). This entry is left out of the site, search and Next links until it can be read. Check that it still exists and that you have permission to read it.`
		};
	}
	let parsed;
	try {
		// Passing options skips gray-matter's cache, which stores a file before parsing it,
		// so a cached broken entry would come back as empty data instead of throwing again.
		parsed = matter(raw, {});
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
