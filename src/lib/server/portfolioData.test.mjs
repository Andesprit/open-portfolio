import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isBasePath, loadPortfolioData } from './portfolioData.js';

test('loads a valid YAML portfolio configuration', () => {
	const portfolio = loadPortfolioData();

	assert.ok(
		isBasePath(portfolio.settings.basePath),
		`settings.basePath is ${JSON.stringify(portfolio.settings.basePath)}; use "" or "/repository-name"`
	);
	assert.ok(Array.isArray(portfolio.sections));
	assert.ok(portfolio.sections.length > 0);
	assert.ok(Array.isArray(portfolio.social));
});

test('a root site with basePath "" passes, like a "/name" project site; malformed paths fail', () => {
	const dir = mkdtempSync(join(tmpdir(), 'portfolio-data-'));
	try {
		const file = join(dir, 'portfolio-data.yaml');
		writeFileSync(file, 'settings:\n  basePath: ""\nsections: []\nsocial: []\n');
		const { basePath } = loadPortfolioData(file).settings;
		assert.equal(basePath, '');
		assert.ok(isBasePath(basePath));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
	for (const value of [undefined, '/portfolio', '/open-portfolio', '/my.site_v2'])
		assert.ok(isBasePath(value), String(value));
	for (const value of ['portfolio', '/portfolio/', '/', '/my/portfolio', '/my portfolio', null, 5])
		assert.ok(!isBasePath(value), String(value));
});
