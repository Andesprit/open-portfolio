import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { validatePortfolio } from '../utils/validatePortfolio.js';
import { contentDirectory, readContentFolder } from '../utils/contentEntries.js';

/** @param {string} root */
export function readPortfolioWarnings(root) {
	const data = JSON.parse(readFileSync(join(root, 'src/content/data/portfolio-data.json'), 'utf8'));
	/** @param {string} path @param {'isFile' | 'isDirectory'} kind */
	function exists(path, kind) {
		try { return statSync(join(root, path))[kind](); }
		catch { return false; }
	}
	const warnings = validatePortfolio(data, {
		isFile: (path) => exists(path, 'isFile'),
		isDirectory: (path) => exists(path, 'isDirectory')
	});
	// Markdown frontmatter problems, one per file and field, from the same reader the pages use.
	for (const section of Array.isArray(data.sections) ? data.sections : []) {
		if (typeof section?.path !== 'string' || !section.path.trim()) continue;
		const directory = contentDirectory(section.path);
		if (exists(directory, 'isDirectory')) warnings.push(...readContentFolder(root, directory).warnings);
	}
	return warnings;
}
