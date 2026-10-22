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
