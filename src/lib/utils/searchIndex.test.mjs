import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, searchEntries } from './searchIndex.ts';

test('index uses base-rooted detail URLs, excludes skipped items and unrendered sections', () => {
	const sections = [
		{ title: 'Blog Posts', type: 'cards_outside', path: 'posts' },
		{
			title: 'Skills',
			type: 'cards_with_icons',
			content: [{ name: 'Languages', skills: ['Python'] }]
		},
		{ title: 'Hidden', type: 'unknown', content: [{ title: 'Hidden item' }] },
		{ title: 123, type: 'cards' }
	];
	const entries = buildSearchIndex(sections, '/portfolio', () => [
		{
			slug: 'typescript',
			metadata: {
				title: 'TypeScript guide',
				description: '<b>Learn types</b>',
				tags: ['Code'],
				skip: false
			}
		},
		{ slug: 'skipped', metadata: { title: 'Skipped', skip: true } }
	]);
	assert.equal(entries.length, 4);
	assert.equal(searchEntries(entries, 'tYpeScript')[0].href, '/portfolio/blog-posts/typescript');
	assert.equal(searchEntries(entries, 'learn code')[0].text, 'Learn types');
	assert.equal(searchEntries(entries, 'python')[0].section, 'Skills');
	assert.equal(searchEntries(entries, 'python')[0].href, '/portfolio/#skills');
	assert.deepEqual(searchEntries(entries, 'skipped'), []);
	assert.deepEqual(searchEntries(entries, 'hidden'), []);
	assert.deepEqual(searchEntries(entries, 'xyzzy'), []);
	assert.deepEqual(searchEntries(entries, '  '), []);
	assert.equal(buildSearchIndex(sections.slice(1, 2), '', () => [])[0].href, '/#skills');
});
