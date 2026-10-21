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
function suggestion(value, options) {
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
	return `${closest ? `Did you mean "${closest}"? ` : ''}Use one of: ${options.join(', ')}.`;
}

/** @param {{ settings?: { theme?: unknown }, sections?: Array<{ type?: unknown }> }} data */
export function validatePortfolio(data) {
	/** @type {string[]} */
	const warnings = [];
	/** @param {string} location @param {unknown} value @param {string[]} options */
	function check(location, value, options) {
		if (typeof value !== 'string' || !options.includes(value)) {
			warnings.push(`${location}: ${JSON.stringify(value)} is not supported. ${suggestion(value, options)}`);
		}
	}
	check('settings.theme', data.settings?.theme, availableThemes);
	if (Array.isArray(data.sections)) {
		data.sections.forEach((section, index) => check(`sections[${index}].type`, section?.type, sectionTypes));
	}
	return warnings;
}
