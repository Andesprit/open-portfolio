import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownPreview } from './markdownPreview.ts';
import { getAbsoluteLink } from './linkUtils.ts';

test('relative social files resolve at the portfolio root from every page', () => {
	assert.equal(getAbsoluteLink('CV.pdf', '/portfolio'), '/portfolio/CV.pdf');
	assert.equal(getAbsoluteLink('./CV.pdf', ''), '/CV.pdf');
	for (const link of ['https://example.com', 'http://example.com', 'mailto:a@b.test', '/CV.pdf', '//example.com', '#contact']) {
		assert.equal(getAbsoluteLink(link, '/portfolio'), link);
	}
});

test('markdown preview renders formatted, balanced HTML without a DOM', () => {
	const result = markdownPreview('Hello **beautiful _world_** and goodbye.', 17);
	assert.equal(result.truncated, true);
	assert.equal(result.html, '<p>Hello <strong>beautiful <em>w...</em></strong></p>');
	assert.match(markdownPreview('Hello **world**', 100).html, /<strong>world<\/strong>/);
	assert.equal(markdownPreview('Hello **world**', 100).truncated, false);
});

test('preview keeps entities and quoted HTML attributes intact', () => {
	assert.equal(markdownPreview('A &amp; B beyond', 5).html, '<p>A &amp; B...</p>');
	assert.equal(markdownPreview('<span title="a > b">abcdef</span>', 3).html, '<p><span title="a > b">abc...</span></p>');
	assert.equal(markdownPreview('😀😀😀', 2).html, '<p>😀😀...</p>');
	assert.equal(markdownPreview('', 10).truncated, false);
});
