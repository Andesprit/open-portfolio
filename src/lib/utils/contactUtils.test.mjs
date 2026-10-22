import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyText, emailAddress, findSocial, mailtoHref } from './contactUtils.ts';

const setClipboard = (value) =>
	Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value });

test('bare and mailto-prefixed emails keep one scheme and a clean address', () => {
	for (const link of ['a@b.test', ' mailto:a@b.test ', 'MAILTO:a@b.test']) {
		assert.equal(emailAddress(link), 'a@b.test');
		assert.equal(mailtoHref(link), 'mailto:a@b.test');
	}
	assert.equal(emailAddress('mailto:a@b.test?subject=Hi'), 'a@b.test');
	assert.equal(mailtoHref('mailto:a@b.test?subject=Hi'), 'mailto:a@b.test?subject=Hi');
});

test('only configured entries with a link are offered', () => {
	const social = [{ name: 'Email', link: '  ' }, { name: 'resume', link: 'CV.pdf' }];
	assert.equal(findSocial(social, 'email'), undefined);
	assert.equal(findSocial(social, 'resume')?.link, 'CV.pdf');
});

test('copy reports failure when the clipboard is missing or refuses, then succeeds on retry', async () => {
	setClipboard(undefined);
	assert.equal(await copyText('a@b.test'), false);
	setClipboard({ writeText: () => Promise.reject(new Error('NotAllowedError')) });
	assert.equal(await copyText('a@b.test'), false);
	let written;
	setClipboard({ writeText: async (text) => { written = text; } });
	assert.equal(await copyText('a@b.test'), true);
	assert.equal(written, 'a@b.test');
});
