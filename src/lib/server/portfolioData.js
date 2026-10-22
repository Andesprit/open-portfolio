import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export const portfolioDataPath = join(
	process.cwd(),
	'src',
	'content',
	'data',
	'portfolio-data.yaml'
);

/**
 * settings.basePath: "" (or no key) for a site at the root of its address, such as a
 * <username>.github.io repository or a custom domain, or "/name" for a GitHub project site.
 * SvelteKit rejects null, so only a missing key counts as the root.
 *
 * @param {unknown} basePath
 */
export function isBasePath(basePath) {
	return (
		basePath === undefined ||
		(typeof basePath === 'string' && /^(\/[A-Za-z0-9._-]+)?$/.test(basePath))
	);
}

/**
 * Read and validate the portfolio's YAML configuration.
 *
 * @param {string} [filePath]
 * @returns {{ settings: Record<string, unknown>, sections: unknown[], social: unknown[] }}
 */
export function loadPortfolioData(filePath = portfolioDataPath) {
	const portfolioData = parse(readFileSync(filePath, 'utf-8'));

	if (!portfolioData || typeof portfolioData !== 'object') {
		throw new Error('portfolio-data.yaml must contain a YAML object.');
	}

	if (!portfolioData.settings || typeof portfolioData.settings !== 'object') {
		throw new Error('portfolio-data.yaml must define settings.');
	}

	if (!Array.isArray(portfolioData.sections)) {
		throw new Error('portfolio-data.yaml must define a sections array.');
	}

	if (!Array.isArray(portfolioData.social)) {
		throw new Error('portfolio-data.yaml must define a social array.');
	}

	return portfolioData;
}
