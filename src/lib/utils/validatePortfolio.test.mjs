import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePortfolio } from './validatePortfolio.js';

const sample = JSON.parse(fs.readFileSync(new URL('../../content/data/portfolio-data.json', import.meta.url), 'utf8'));

test('the shipped portfolio needs no config warnings', () => {
	assert.deepEqual(validatePortfolio(sample), []);
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
	const warnings = validatePortfolio({ settings: { theme: '???' }, sections: [{ type: null }] });
	assert.match(warnings[0], /settings\.theme.*"\?\?\?".*Use one of:.*ocean-dark/);
	assert.match(warnings[1], /sections\[0\]\.type.*null.*Use one of:.*cards_outside/);
	assert(warnings.every((warning) => !warning.includes('Did you mean')));
});
