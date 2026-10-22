import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';

const repo = process.cwd();
const doctor = join(repo, 'scripts/doctor.mjs');
const dataFile = 'src/content/data/portfolio-data.yaml';
const sample = parse(readFileSync(join(repo, dataFile), 'utf8'));

/** A throwaway portfolio with the sample content; `data` replaces the config text. */
function run({ data = stringify(sample), modules = true, args = [], extra = () => {} } = {}) {
	const root = mkdtempSync(join(tmpdir(), 'portfolio-doctor-'));
	try {
		cpSync(join(repo, 'package.json'), join(root, 'package.json'));
		cpSync(join(repo, 'src/content'), join(root, 'src/content'), { recursive: true });
		cpSync(join(repo, 'static'), join(root, 'static'), { recursive: true });
		if (data === null) rmSync(join(root, dataFile));
		else writeFileSync(join(root, dataFile), data);
		if (modules) symlinkSync(join(repo, 'node_modules'), join(root, 'node_modules'));
		extra(root);
		const before = data === null ? null : readFileSync(join(root, dataFile));
		const result = spawnSync(process.execPath, [doctor, ...args], { cwd: root, encoding: 'utf8' });
		if (before) assert.deepEqual(readFileSync(join(root, dataFile)), before, 'doctor must not change the config');
		return { code: result.status, out: result.stdout, err: result.stderr };
	} finally { rmSync(root, { recursive: true, force: true }); }
}
const withSettings = (settings) => stringify({ ...sample, settings: { ...sample.settings, ...settings } });

test('a healthy project site reports what was checked, its base and the preview address', () => {
	const { code, out, err } = run({ data: withSettings({ basePath: '/portfolio' }) });
	assert.equal(code, 0);
	assert.equal(err, '');
	assert.match(out, /Checked: installed packages/);
	assert.match(out, /"\/portfolio"/);
	assert.match(out, /http:\/\/localhost:4173\/portfolio\//);
	assert.match(out, /did not build, preview or deploy/);
});

test('a root site previews at /, whether basePath is "" or omitted', () => {
	const { basePath, ...settings } = sample.settings;
	for (const data of [withSettings({ basePath: '' }), stringify({ ...sample, settings })]) {
		const { code, out } = run({ data });
		assert.equal(code, 0);
		assert.match(out, /\(site root\)/);
		assert.match(out, /http:\/\/localhost:4173\/ /);
	}
});

test('blocking setup problems give one line naming the fix and exit 1', () => {
	const cases = [
		[{ data: withSettings({ basePath: 'portfolio' }) }, /settings\.basePath is "portfolio".*must start with "\/"/],
		[{ data: withSettings({ basePath: '/portfolio/' }) }, /must not end with "\/"/],
		[{ data: withSettings({ basePath: 5 }) }, /settings\.basePath is 5/],
		[{ data: withSettings({ basePath: null }) }, /settings\.basePath is null\. Use "" \(or leave the key out\)/],
		[{ data: 'settings:\n  name: Part 1: Setup\n' }, /not valid YAML: .*line 2, column 9\. Fix that spot/],
		[{ data: null }, /portfolio-data\.yaml is missing/],
		[{ data: '[]' }, /must contain the settings:, sections: and social: groups/],
		[{ data: '' }, /must contain the settings:, sections: and social: groups/],
		[{ data: '{"sections": []}' }, /"settings" must be a group of fields/],
		[{ data: stringify({ ...sample, social: undefined }) }, /"social" must be a list/],
		[{ data: stringify({ ...sample, sections: {} }) }, /"sections" must be a list/],
		[{ modules: false }, /package\(s\) are not installed.*npm ci/]
	];
	for (const [options, message] of cases) {
		const { code, out, err } = run(options);
		assert.equal(code, 1, err);
		assert.equal(out, '');
		assert.match(err, message);
		assert.doesNotMatch(err, /\n\s+at /, 'no stack trace');
	}
});

test('content warnings are shown but do not block', () => {
	const { code, out, err } = run({
		extra: (root) => writeFileSync(join(root, 'src/content/blogs/zz-tags.md'), '---\ntitle: T\ndescription: D\ndate: 2024-01-01\ntags: 42\n---\nBody\n')
	});
	assert.equal(code, 0);
	assert.match(err, /Warning: src\/content\/blogs\/zz-tags\.md: tags: 42/);
	assert.match(out, /1 warning\(s\) above/);
});

test('--help explains the command and unknown options are refused', () => {
	const help = run({ args: ['--help'] });
	assert.equal(help.code, 0);
	assert.match(help.out, /Usage: npm run doctor/);
	const unknown = run({ args: ['--fix'] });
	assert.equal(unknown.code, 2);
	assert.match(unknown.err, /Unknown option "--fix"[\s\S]*Usage/);
});
