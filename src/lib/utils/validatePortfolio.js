import { availableThemes } from '../themes.js';

const sectionTypes = ['cards_with_link', 'cards_with_icons', 'cards', 'cards_outside'];

/** @param {string} value @param {string} option */
function editDistance(value, option) {
	let previous = Array.from({ length: option.length + 1 }, (_, index) => index);
	for (let i = 1; i <= value.length; i++) {
		const row = [i];
		for (let j = 1; j <= option.length; j++) {
			row[j] = Math.min(row[j - 1] + 1, previous[j] + 1,
				previous[j - 1] + (value[i - 1] === option[j - 1] ? 0 : 1));
		}
		previous = row;
	}
	return previous[option.length];
}

/** @param {unknown} value @param {string[]} options */
function closestOption(value, options) {
	let closest = '';
	let distance = 3;
	if (typeof value === 'string') {
		for (const option of options) {
			const next = editDistance(value, option);
			if (next < distance) {
				closest = option;
				distance = next;
			}
		}
	}
	return closest;
}

/** @param {unknown} value @returns {Record<string, unknown>} */
function asObject(value) {
	return value && typeof value === 'object' && !Array.isArray(value)
		? /** @type {Record<string, unknown>} */ (value) : {};
}

/**
 * File checks are supplied by the server so the validator itself stays pure.
 * @param {unknown} data
 * @param {{ isFile?: (path: string) => boolean, isDirectory?: (path: string) => boolean }} files
 */
export function validatePortfolio(data, files = {}) {
	const portfolio = asObject(data);
	const settings = asObject(portfolio.settings);
	/** @type {string[]} */
	const warnings = [];
	/** @param {unknown} value */
	const show = (value) => value === undefined ? '(missing)' : JSON.stringify(value);
	/** @param {string} location @param {unknown} value @param {string[]} options */
	function check(location, value, options) {
		if (typeof value !== 'string' || !options.includes(value)) {
			const closest = closestOption(value, options);
			warnings.push(`${location}: ${show(value)} is not supported. ${closest ? `Did you mean "${closest}"? ` : ''}Use one of: ${options.join(', ')}.`);
		}
	}
	/** @param {string} location @param {unknown} value */
	function required(location, value) {
		if (typeof value !== 'string' || !value.trim()) {
			warnings.push(`${location}: ${show(value)} must be a non-empty string. Add a name or title here.`);
		}
	}
	/** @param {Record<string, unknown>} object @param {string} location @param {string[]} keys */
	function checkKeys(object, location, keys) {
		for (const key of Object.keys(object)) {
			if (keys.includes(key)) continue;
			const closest = closestOption(key, keys);
			if (closest) warnings.push(`${location}${key}: unknown key with value ${show(object[key])}. Did you mean "${closest}"?`);
		}
	}
	/** @param {Record<string, unknown>} object @param {string} location */
	function checkImages(object, location) {
		for (const key of ['potrait_image', 'icon', 'image']) {
			const value = object[key];
			if (typeof value !== 'string' || !value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;
			let relative = value.split(/[?#]/)[0].replace(/^\.\//, '');
			const base = typeof settings.basePath === 'string' ? settings.basePath.replace(/\/$/, '') : '';
			if (base && relative.startsWith(`${base}/`)) relative = relative.slice(base.length);
			relative = relative.replace(/^\/+/, '');
			try { relative = decodeURIComponent(relative); } catch { /* Keep malformed URL text for the file warning. */ }
			const file = `static/${relative}`;
			if (files.isFile?.(file) === false) {
				warnings.push(`${location}.${key}: ${show(value)} refers to a missing file. Add it at "${file}" or update this path.`);
			}
		}
	}
	checkKeys(portfolio, '', ['settings', 'sections', 'social']);
	checkKeys(settings, 'settings.', ['basePath', 'bio', 'expertises', 'name', 'potrait_image', 'theme', 'title', 'cards_before_pagination', 'icon', 'image']);
	required('settings.name', settings.name);
	if (settings.theme !== undefined) check('settings.theme', settings.theme, availableThemes);
	checkImages(settings, 'settings');
	if (Array.isArray(portfolio.social)) {
		portfolio.social.forEach((value, index) => {
			const item = asObject(value);
			checkKeys(item, `social[${index}].`, ['name', 'link', 'icon', 'image']);
			checkImages(item, `social[${index}]`);
		});
	}
	const anchors = new Map();
	if (Array.isArray(portfolio.sections)) {
		portfolio.sections.forEach((value, index) => {
			const section = asObject(value);
			const location = `sections[${index}]`;
			checkKeys(section, `${location}.`, ['title', 'type', 'path', 'content', 'truncation_limit', 'route', 'icon', 'image']);
			required(`${location}.title`, section.title);
			check(`${location}.type`, section.type, sectionTypes);
			if (typeof section.title === 'string' && section.title.trim()) {
				const anchor = section.title.toLowerCase().replace(/\s+/g, '-');
				if (anchors.has(anchor)) {
					warnings.push(`${location}.title: ${show(section.title)} collides with ${anchors.get(anchor)} at #${anchor}. Use a unique section title.`);
				} else anchors.set(anchor, `${location}.title`);
			}
			if (section.type === 'cards_outside' || section.path !== undefined) {
				if (typeof section.path !== 'string' || !section.path.trim()) {
					warnings.push(`${location}.path: ${show(section.path)} must be a non-empty directory path, for example "src/content/projects/".`);
				} else {
					const normalized = section.path.replace(/\/$/, '').replace(/^\//, '');
					const directory = normalized.startsWith('src/') ? normalized : `src/${normalized}`;
					if (files.isDirectory?.(directory) === false) {
						warnings.push(`${location}.path: ${show(section.path)} refers to a missing directory. Create "${directory}" or update this path.`);
					}
				}
			}
			checkImages(section, location);
			if (Array.isArray(section.content)) {
				section.content.forEach((value, itemIndex) => {
					const item = asObject(value);
					const itemLocation = `${location}.content[${itemIndex}]`;
					checkKeys(item, `${itemLocation}.`, ['title', 'name', 'date', 'description', 'organization', 'publication', 'icon', 'image', 'link', 'skills', 'display_order']);
					checkImages(item, itemLocation);
				});
			}
		});
	}
	return warnings;
}
