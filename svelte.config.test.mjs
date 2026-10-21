import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import config from './svelte.config.js';

test('missing local assets warn with the file, referring page and static location', (t) => {
	const warning = t.mock.method(fs, 'writeSync', () => 0);
	const base = config.kit.paths.base;
	for (const file of ['images/my-photo-missing.png', 'icons/gogle-icon.svg', 'CV.pdf', 'downloads/data.csv']) {
		config.kit.prerender.handleHttpError({ status: 404, path: `${base}/${file}`, referrer: `${base}/projects/example`, referenceType: 'linked', message: '404' });
		assert.equal(warning.mock.calls.at(-1).arguments[0], 2);
		const message = warning.mock.calls.at(-1).arguments[1];
		assert(message.includes(`${base}/${file}`));
		assert(message.includes(`${base}/projects/example`));
		assert(message.includes(`static/${file}`));
	}
	assert.equal(warning.mock.callCount(), 4);
});

test('broken page links and unexpected asset errors still fail', () => {
	assert.equal(typeof config.kit.prerender.handleHttpError, 'function');
	for (const [status, path] of [[404, '/projects/no-such-page'], [404, '/missing.html'], [500, '/images/photo.png']]) {
		const message = `${status} ${path}`;
		assert.throws(() => config.kit.prerender.handleHttpError({ status, path, referrer: '/', referenceType: 'linked', message }), { message });
	}
});
