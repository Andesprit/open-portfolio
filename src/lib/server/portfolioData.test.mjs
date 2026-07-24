import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPortfolioData } from './portfolioData.js';

test('loads a valid YAML portfolio configuration', () => {
	const portfolio = loadPortfolioData();

	assert.match(portfolio.settings.basePath, /^\/[A-Za-z0-9._-]+$/);
	assert.ok(Array.isArray(portfolio.sections));
	assert.ok(portfolio.sections.length > 0);
	assert.ok(Array.isArray(portfolio.social));
});
