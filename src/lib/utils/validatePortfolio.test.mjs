import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePortfolio } from './validatePortfolio.js';

const sample = JSON.parse(fs.readFileSync(new URL('../../content/data/portfolio-data.json', import.meta.url), 'utf8'));

test('the shipped portfolio needs no config warnings', () => {
	assert.deepEqual(validatePortfolio(sample), []);
});

test('omitting the optional theme keeps the existing default without warnings', () => {
	const data = structuredClone(sample);
	delete data.settings.theme;
	assert.deepEqual(validatePortfolio(data), []);
});

test('theme and section typos name the JSON location, bad value and likely fix', () => {
	const data = structuredClone(sample);
	data.settings.theme = 'ocean-drak';
	data.sections[2].type = 'card_with_icons';
	const warnings = validatePortfolio(data);
	assert.equal(warnings.length, 2);
	assert.match(warnings[0], /settings\.theme.*"ocean-drak".*Did you mean "ocean-dark"/);
	assert.match(warnings[1], /sections\[2\]\.type.*"card_with_icons".*Did you mean "cards_with_icons"/);
});

test('unrecognisable values list valid options rather than guessing', () => {
	const warnings = validatePortfolio({ settings: { name: 'Owner', theme: '???' }, sections: [{ title: 'Work', type: null }] });
	assert.match(warnings[0], /settings\.theme.*"\?\?\?".*Use one of:.*ocean-dark/);
	assert.match(warnings[1], /sections\[0\]\.type.*null.*Use one of:.*cards_outside/);
	assert(warnings.every((warning) => !warning.includes('Did you mean')));
});

test('required names and titles explain how to fill in missing or blank values', () => {
	const data = structuredClone(sample);
	delete data.settings.name;
	data.sections[0].title = '  ';
	const warnings = validatePortfolio(data);
	assert.match(warnings[0], /settings\.name.*missing.*non-empty string/i);
	assert.match(warnings[1], /sections\[0\]\.title.*"  ".*non-empty string/);
});

test('section titles that produce the same navigation anchor name both locations', () => {
	const data = structuredClone(sample);
	data.sections[0].title = 'My Work';
	data.sections[1].title = 'MY\tWORK';
	assert.match(validatePortfolio(data)[0], /sections\[1\]\.title.*sections\[0\]\.title.*#my-work.*unique/i);
});

test('likely key typos get a suggestion while custom keys remain allowed', () => {
	const data = structuredClone(sample);
	data.settings.portrait_image = data.settings.potrait_image;
	delete data.settings.potrait_image;
	data.settings.custom_field = 'keep me';
	data.sections[0].truncation_limt = 100;
	const warnings = validatePortfolio(data);
	assert.equal(warnings.length, 2);
	assert.match(warnings[0], /settings\.portrait_image.*Did you mean "potrait_image"/);
	assert.match(warnings[1], /sections\[0\]\.truncation_limt.*Did you mean "truncation_limit"/);
});

test('missing content directories use the same src prefix rule as the markdown loader', () => {
	const data = structuredClone(sample);
	data.sections[1].path = '/content/projectz/';
	const checked = [];
	const warnings = validatePortfolio(data, { isDirectory: (path) => { checked.push(path); return path !== 'src/content/projectz'; } });
	assert(checked.includes('src/content/projectz'));
	assert.match(warnings[0], /sections\[1\]\.path.*"\/content\/projectz\/".*directory.*src\/content\/projectz.*update/i);
});

test('missing local assets identify their JSON locations and static destinations', () => {
	const data = structuredClone(sample);
	data.settings.potrait_image = 'images/my-photo-missing.png';
	data.social[1].icon = '/portfolio/icons/lost.svg?version=2#icon';
	data.sections[0].content[0].icon = './icons/gogle-icon.svg';
	data.sections[0].content[1].image = '/images/missing%20photo.png';
	const missing = ['static/images/my-photo-missing.png', 'static/icons/lost.svg', 'static/icons/gogle-icon.svg', 'static/images/missing photo.png'];
	const warnings = validatePortfolio(data, { isFile: (path) => !missing.includes(path) });
	assert.equal(warnings.length, 4);
	for (const [index, location] of ['settings.potrait_image', 'social[1].icon', 'sections[0].content[0].icon', 'sections[0].content[1].image'].entries()) {
		assert(warnings[index].includes(location));
		assert(warnings[index].includes(missing[index]));
		assert.match(warnings[index], /Add.*or update/);
	}
});

test('external, embedded and empty optional images do not get file checks', () => {
	const data = { settings: { name: 'Owner', theme: 'light', potrait_image: 'data:image/png;base64,abc' }, social: [
		{ icon: 'https://example.com/icon.svg' }, { icon: '//cdn.example.com/icon.svg' }, { icon: '' }, { icon: 'blob:some-id' }
	], sections: [] };
	assert.deepEqual(validatePortfolio(data, { isFile: () => { throw new Error('not a local file'); } }), []);
});
