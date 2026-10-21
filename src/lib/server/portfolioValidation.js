import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { validatePortfolio } from '../utils/validatePortfolio.js';

/** @param {string} root */
export function readPortfolioWarnings(root) {
	const data = JSON.parse(readFileSync(join(root, 'src/content/data/portfolio-data.json'), 'utf8'));
	/** @param {string} path @param {'isFile' | 'isDirectory'} kind */
	function exists(path, kind) {
		try { return statSync(join(root, path))[kind](); }
		catch { return false; }
	}
	return validatePortfolio(data, {
		isFile: (path) => exists(path, 'isFile'),
		isDirectory: (path) => exists(path, 'isDirectory')
	});
}
