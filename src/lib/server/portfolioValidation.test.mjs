import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readPortfolioWarnings } from './portfolioValidation.js';

test('the shipped config and its actual local files need no warnings', () => {
	assert.deepEqual(readPortfolioWarnings(process.cwd()), []);
});

test('a new config is checked against actual files and directories on every read', () => {
	const root = mkdtempSync(join(tmpdir(), 'portfolio-validation-'));
	try {
		mkdirSync(join(root, 'src/content/data'), { recursive: true });
		writeFileSync(join(root, 'src/content/data/portfolio-data.yaml'), JSON.stringify({
			settings: { name: 'Owner', theme: 'light', potrait_image: 'images/portrait.png' },
			sections: [{ title: 'Work', type: 'cards_outside', path: 'src/content/work/' }]
		}));
		assert.equal(readPortfolioWarnings(root).length, 2);
		mkdirSync(join(root, 'static/images'), { recursive: true });
		writeFileSync(join(root, 'static/images/portrait.png'), 'image');
		mkdirSync(join(root, 'src/content/work'), { recursive: true });
		assert.deepEqual(readPortfolioWarnings(root), []);
	} finally { rmSync(root, { recursive: true, force: true }); }
});
