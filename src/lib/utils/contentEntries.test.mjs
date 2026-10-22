import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { contentDirectory, normalizeMetadata, readContentFolder } from './contentEntries.js';
import { generateRoutes } from './routeUtils.ts';
import { loadNavigationItems, findNextItem } from './navigationUtils.ts';
import { buildSearchIndex } from './searchIndex.ts';
import { sortByOrderAndDate } from './dateSortUtils.ts';
import { readPortfolioWarnings } from '../server/portfolioValidation.js';

const post = (frontmatter) => `---\n${frontmatter}\n---\n\n# Body\n`;

/** A custom section path with healthy, mistyped and unreadable entries side by side. */
function fixture() {
	const root = mkdtempSync(join(tmpdir(), 'portfolio-content-'));
	mkdirSync(join(root, 'src/content/data'), { recursive: true });
	mkdirSync(join(root, 'src/notes'), { recursive: true });
	writeFileSync(join(root, 'src/content/data/portfolio-data.yaml'), JSON.stringify({
		settings: { name: 'Owner' },
		sections: [{ title: 'Field Notes', type: 'cards_outside', path: 'notes/' }]
	}));
	const files = {
		'a-healthy.md': post('title: "Healthy"\ndate: "01-02-2024"\ntags: TypeScript, Svelte\ndisplay_order: 2'),
		'b-numeric-tags.md': post('title: "Numbers"\ntags: 42\ndisplay_order: 1'),
		'c-broken.md': post('title: Part 1: Setup'),
		'd-list-root.md': post('- just\n- a list'),
		'e-external.md': post('title: "External"\nskip: true\nlink: "https://example.com"'),
		'f-skip-no-link.md': post('title: "Nowhere"\nskip: true'),
		'g-unquoted-date.md': post('title: "Dated"\ndate: 2023-05-04\ntags: [Go, 7]')
	};
	for (const [file, text] of Object.entries(files)) writeFileSync(join(root, 'src/notes', file), text);
	return root;
}

test('shipped content has no Markdown warnings', () => {
	assert.deepEqual(readPortfolioWarnings(process.cwd()), []);
});

test('custom section paths resolve the same way everywhere', () => {
	assert.equal(contentDirectory('notes/'), 'src/notes');
	assert.equal(contentDirectory('/src/content/blogs/'), 'src/content/blogs');
});

test('one unreadable entry is isolated and every consumer agrees on what exists', () => {
	const root = fixture();
	const cwd = process.cwd();
	try {
		process.chdir(root);
		const { entries, warnings } = readContentFolder(root, 'src/notes');
		const slugs = entries.map((entry) => entry.slug);
		assert.deepEqual(slugs, ['a-healthy', 'b-numeric-tags', 'd-list-root', 'e-external', 'f-skip-no-link', 'g-unquoted-date']);

		// gray-matter would otherwise return its cached empty parse on the second read.
		assert.deepEqual(readContentFolder(root, 'src/notes').entries.map((entry) => entry.slug), slugs);

		const broken = warnings.find((warning) => warning.startsWith('src/notes/c-broken.md:'));
		assert.match(broken, /could not be read \(line 2, column \d+: .+\)\. This entry is left out of the site, search and Next links/);
		assert.match(broken, /title: "Part 1: Setup"/);

		const data = { sections: [{ title: 'Field Notes', type: 'cards_outside', path: 'notes/' }] };
		const routes = generateRoutes(data);
		assert.deepEqual(routes.map((route) => route.slug), slugs);
		assert.ok(routes.every((route) => route.type === 'field-notes'));

		const navigation = loadNavigationItems(join(root, 'src/notes'));
		// Next skips only the external entry; display_order still comes first.
		assert.deepEqual(navigation.map((item) => item.slug).slice(0, 2), ['b-numeric-tags', 'a-healthy']);
		assert.deepEqual(navigation.map((item) => item.slug).sort(), slugs.filter((slug) => slug !== 'e-external'));
		for (const item of navigation) {
			assert.ok(slugs.includes(findNextItem(navigation, item.slug, 'field-notes').slug));
		}

		const loader = () => entries.map(({ slug, metadata }) => ({ slug, metadata, html: '' }));
		const hrefs = buildSearchIndex(data.sections, '/portfolio', loader).map((entry) => entry.href);
		assert.ok(!hrefs.some((href) => href.includes('c-broken')));
		assert.ok(!hrefs.some((href) => href.includes('e-external')));
		// The search shows exactly the routed, non-skipped entries.
		assert.deepEqual(hrefs.slice(1), entries.filter((entry) => !entry.metadata.skip).map((entry) => `/portfolio/field-notes/${entry.slug}`));

		// Fixing the file brings it back everywhere, with no warning left.
		writeFileSync(join(root, 'src/notes/c-broken.md'), post('title: "Part 1: Setup"'));
		assert.ok(generateRoutes(data).some((route) => route.slug === 'c-broken'));
		assert.ok(loadNavigationItems(join(root, 'src/notes')).some((item) => item.slug === 'c-broken'));
		assert.ok(!readPortfolioWarnings(root).some((warning) => warning.includes('c-broken')));
	} finally {
		process.chdir(cwd);
		rmSync(root, { recursive: true, force: true });
	}
});

test('warnings name the file, the field, the supported form and the fallback', () => {
	const root = fixture();
	try {
		const warnings = readPortfolioWarnings(root);
		const find = (prefix) => warnings.find((warning) => warning.startsWith(prefix));
		assert.equal(find('src/notes/b-numeric-tags.md: tags:'), 'src/notes/b-numeric-tags.md: tags: 42 is not supported. Use a comma-separated list (tags: TypeScript, Svelte) or brackets (tags: [TypeScript, Svelte]). Using the single tag "42" for now.');
		assert.match(find('src/notes/d-list-root.md:'), /not a list of fields.*Using no metadata for now/);
		assert.match(find('src/notes/f-skip-no-link.md:'), /skip: true sends visitors to link, but there is no usable link.*Showing the page for now/);
		assert.match(find('src/notes/g-unquoted-date.md: tags:'), /Using the tags "Go", "7" for now/);
		assert.ok(!find('src/notes/a-healthy.md'));
		assert.ok(!find('src/notes/e-external.md'));
		assert.ok(!find('src/notes/g-unquoted-date.md: date'));
	} finally { rmSync(root, { recursive: true, force: true }); }
});

test('a file that cannot be opened is reported as a disk problem, not a YAML mistake', { skip: process.getuid?.() === 0 }, () => {
	const root = fixture();
	try {
		chmodSync(join(root, 'src/notes/a-healthy.md'), 0o000);
		const { entries, warnings } = readContentFolder(root, 'src/notes');
		assert.ok(!entries.some((entry) => entry.slug === 'a-healthy'));
		assert.match(warnings.find((warning) => warning.startsWith('src/notes/a-healthy.md:')), /could not be opened \(EACCES\).*permission/);
		chmodSync(join(root, 'src/notes'), 0o000);
		assert.match(readPortfolioWarnings(root).at(-1), /^src\/notes: the folder could not be read \(EACCES\)/);
	} finally {
		chmodSync(join(root, 'src/notes'), 0o755);
		chmodSync(join(root, 'src/notes/a-healthy.md'), 0o644);
		rmSync(root, { recursive: true, force: true });
	}
});

test('valid formats pass through unchanged and invalid ones use safe fallbacks', () => {
	const ok = (data) => {
		const result = normalizeMetadata(data, 'x.md');
		assert.deepEqual(result.warnings, []);
		return result.metadata;
	};
	assert.deepEqual(ok({ tags: 'a, b ,c' }).tags, ['a', 'b', 'c']);
	assert.deepEqual(ok({ tags: ['a', 'b'] }).tags, ['a', 'b']);
	assert.equal(ok({ date: new Date('2024-12-20') }).date, '2024-12-20');
	assert.equal(ok({ display_order: 3 }).display_order, 3);
	assert.deepEqual(ok({}), { title: 'Untitled', date: '', link: '', tags: [], description: '', skip: false, display_order: Infinity, image: '' });

	const bad = (data) => normalizeMetadata(data, 'x.md');
	const destinations = bad({ link: { url: 'https://example.com' }, image: ['cover.png'], skip: true });
	assert.equal(destinations.metadata.link, '');
	assert.equal(destinations.metadata.image, '');
	assert.equal(destinations.metadata.skip, false);
	assert.equal(destinations.warnings.length, 3);
	assert.ok(!JSON.stringify(destinations.metadata).includes('[object Object]'));

	const mixed = bad({ tags: ['a', { b: 1 }, null, 3] });
	assert.deepEqual(mixed.metadata.tags, ['a', '3']);
	assert.match(mixed.warnings[0], /Using the tags "a", "3" for now/);

	const text = bad({ title: 2024, description: { a: 1 }, skip: 'yes', display_order: '1' });
	assert.equal(text.metadata.title, '2024');
	assert.equal(text.metadata.description, '');
	assert.equal(text.metadata.skip, false);
	assert.equal(text.metadata.display_order, Infinity);
	assert.match(text.warnings.join('\n'), /skip: "yes" is not supported\. Use true or false\. Using false, so the page is shown/);
	assert.equal(bad({ title: ['x'] }).metadata.title, 'Untitled');
	assert.equal(bad('hello').metadata.title, 'Untitled');
});

test('same-day YAML timestamps keep their time and sort newest first in the list and Next', () => {
	const root = mkdtempSync(join(tmpdir(), 'portfolio-dates-'));
	try {
		mkdirSync(join(root, 'posts'));
		writeFileSync(join(root, 'posts/a-earlier.md'), post('title: "Earlier"\ndate: 2024-12-20T09:00:00Z'));
		writeFileSync(join(root, 'posts/b-later.md'), post('title: "Later"\ndate: 2024-12-20T18:00:00Z'));
		writeFileSync(join(root, 'posts/c-day.md'), post('title: "Day"\ndate: 2024-12-19'));
		writeFileSync(join(root, 'posts/d-quoted.md'), post('title: "Quoted"\ndate: "12-18-2024"'));
		const { entries, warnings } = readContentFolder(root, 'posts');
		assert.deepEqual(warnings, []);
		assert.deepEqual(entries.map((entry) => entry.metadata.date), ['2024-12-20T09:00:00.000Z', '2024-12-20T18:00:00.000Z', '2024-12-19', '12-18-2024']);
		const newestFirst = ['b-later', 'a-earlier', 'c-day', 'd-quoted'];
		assert.deepEqual([...entries].sort(sortByOrderAndDate).map((entry) => entry.slug), newestFirst);
		assert.deepEqual(loadNavigationItems(join(root, 'posts')).map((item) => item.slug), newestFirst);
	} finally { rmSync(root, { recursive: true, force: true }); }
});
