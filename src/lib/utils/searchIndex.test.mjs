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
	assert.equal(searchEntries(entries, 'python')[0].href, '/portfolio/#skills--item-1');
	assert.deepEqual(searchEntries(entries, 'skipped'), []);
	assert.deepEqual(searchEntries(entries, 'hidden'), []);
	assert.deepEqual(searchEntries(entries, 'xyzzy'), []);
	assert.deepEqual(searchEntries(entries, '  '), []);
	assert.equal(buildSearchIndex(sections.slice(1, 2), '', () => [])[0].href, '/#skills');
});

test('inline results identify original items independently of display sorting and skipped entries', () => {
	const entries = buildSearchIndex(
		[
			{
				title: 'Work Experience',
				type: 'cards_with_link',
				content: [
					{ title: 'Older role', organization: 'IBM', date: '2018' },
					{ title: 'Skipped role', skip: true },
					{ title: 'Current role', organization: 'Google', date: '2024' }
				]
			}
		],
		'/portfolio',
		() => []
	);
	assert.equal(searchEntries(entries, 'ibm')[0].href, '/portfolio/#work-experience--item-1');
	assert.equal(searchEntries(entries, 'google')[0].href, '/portfolio/#work-experience--item-3');
	assert.equal(searchEntries(entries, 'google')[0].targetId, 'work-experience--item-3');
});

const article = (passages, metadata = {}) =>
	buildSearchIndex([{ title: 'Blogs', type: 'cards_outside', path: 'blogs' }], '/portfolio', () => [
		{ slug: 'ts', metadata: { title: 'TypeScript guide', description: 'Why I switched', tags: ['Code'], ...metadata } }
	], () => passages);

const tsPassages = [
	{ text: 'Opening words.' },
	{ id: 'migrating', heading: 'Migrating projects', text: 'Plan the move. Gradual steps help.' },
	{ id: 'phase-1', heading: 'Phase 1: Gradual Adoption', text: 'Create tsconfig.json: start with loose settings.' },
	{ id: 'code', heading: 'Config', text: 'const strictNullChecks = false; useUnknownInCatchVariables' }
];

test('article sections are found by heading or body text and open at that heading', () => {
	const entries = article(tsPassages);
	const [heading] = searchEntries(entries, 'gradual adoption');
	assert.equal(heading.href, '/portfolio/blogs/ts#phase-1');
	assert.equal(heading.heading, 'Phase 1: Gradual Adoption');
	assert.equal(heading.title, 'TypeScript guide');
	const [body] = searchEntries(entries, 'LOOSE settings');
	assert.equal(body.href, '/portfolio/blogs/ts#phase-1');
	assert.match(body.excerpt, /loose settings/);
	// Code text stays searchable: identifiers are what developers remember.
	assert.equal(searchEntries(entries, 'useUnknownInCatchVariables')[0].href, '/portfolio/blogs/ts#code');
	// Words may come from the article title and one section, but not from two sections.
	assert.equal(searchEntries(entries, 'typescript loose')[0].href, '/portfolio/blogs/ts#phase-1');
	assert.deepEqual(searchEntries(entries, 'loose migrating'), []);
	assert.deepEqual(searchEntries(entries, 'nowhere'), []);
});

test('one result per article: whole-article matches win, then heading matches over body matches', () => {
	const entries = article(tsPassages);
	const whole = searchEntries(entries, 'switched');
	assert.equal(whole.length, 1);
	assert.equal(whole[0].href, '/portfolio/blogs/ts');
	assert.equal(whole[0].heading, undefined);
	assert.equal(searchEntries(entries, 'typescript').length, 1);
	// "gradual" is in the Migrating body and the Phase 1 heading; the heading wins.
	const gradual = searchEntries(entries, 'gradual');
	assert.equal(gradual.length, 1);
	assert.equal(gradual[0].href, '/portfolio/blogs/ts#phase-1');
});

test('text before the first heading and articles without headings open the page itself', () => {
	assert.equal(searchEntries(article(tsPassages), 'opening')[0].href, '/portfolio/blogs/ts');
	const [only] = searchEntries(article([{ text: 'A long body without headings mentions Rust here.' }]), 'rust');
	assert.equal(only.href, '/portfolio/blogs/ts');
	assert.equal(only.heading, undefined);
	assert.match(only.excerpt, /mentions Rust here/);
});

test('excerpts are plain text around the match and keep indexed markup as text', () => {
	const long = `${'alpha '.repeat(40)}needle ${'omega '.repeat(40)}`.trim();
	const [hit] = searchEntries(article([{ id: 'a', heading: 'A', text: long }, { id: 'b', heading: 'B', text: 'x <img src=y onerror=alert(1)> z' }]), 'needle');
	assert.match(hit.excerpt, /^… (alpha )+needle( omega)+ …$/);
	assert.ok(hit.excerpt.length < 200);
	assert.equal(searchEntries(article([{ id: 'b', heading: 'B', text: 'x <img src=y onerror=alert(1)> z' }]), 'onerror')[0].excerpt, 'x <img src=y onerror=alert(1)> z');
});

test('passages are only read for entries the canonical reader kept', () => {
	const read = [];
	const entries = buildSearchIndex(
		[{ title: 'Blogs', type: 'cards_outside', path: 'blogs' }],
		'',
		() => [
			{ slug: 'kept', metadata: { title: 'Kept', tags: [] } },
			{ slug: 'hidden', metadata: { title: 'Hidden', tags: [], skip: true } }
		],
		(path, slug) => (read.push(`${path}/${slug}`), [{ id: 'x', heading: 'X', text: 'secret words' }])
	);
	assert.deepEqual(read, ['blogs/kept']);
	assert.equal(searchEntries(entries, 'secret').length, 1);
	assert.equal(searchEntries(entries, 'secret')[0].href, '/blogs/kept#x');
});

test('inline cards keep their own targets and never gain passages', () => {
	const entries = buildSearchIndex(
		[{ title: 'Experience', type: 'cards_with_link', content: [{ title: 'Role', organization: 'Google' }] }],
		'/portfolio',
		() => [],
		() => assert.fail('inline cards have no article text')
	);
	assert.deepEqual(searchEntries(entries, 'google').map((e) => [e.href, e.targetId, e.heading]), [
		['/portfolio/#experience--item-1', 'experience--item-1', undefined]
	]);
});
