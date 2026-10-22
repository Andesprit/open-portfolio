import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registerHooks } from 'node:module';
import { inlineCardIds } from './cardIds.js';
import { readContentFolder } from './contentEntries.js';

// profile.ts and its helpers use extensionless sibling imports, which only Vite resolves.
registerHooks({
	resolve(specifier, context, next) {
		try {
			return next(specifier, context);
		} catch (error) {
			if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context);
			throw error;
		}
	}
});
const { buildProfile } = await import('./profile.ts');
const { sortByOrderAndDate } = await import('./dateSortUtils.ts');

const talks = Array.from({ length: 5 }, (_, i) => ({ title: `Talk ${i + 1}`, organization: 'Conf', date: `200${i + 1}`, description: `**About** ${i + 1}` }));
const sections = [
	{ title: 'Talks and Workshops', type: 'cards', content: talks },
	{ title: 'Skills', type: 'cards_with_icons', content: [{ name: 'B', skills: ['Go'], date: '2020' }, { name: 'A', skills: ['Rust', 'C'], date: '2024' }] },
	{ title: 'Experience', type: 'cards_with_link', content: [{ title: 'Undated', organization: 'X', link: 'docs/x.pdf', skip: true }] },
	{ title: 'Projects', type: 'cards_outside', path: 'src/content/projects/' },
	{ title: '', type: 'cards', content: [{ title: 'Nameless section' }] },
	{ title: 'Gallery', type: 'unknown', content: [{ title: 'Unrendered' }] },
	{ title: 'Empty', type: 'cards', content: [] }
];
const markdown = () => [
	{ slug: 'internal', metadata: { title: 'Internal', date: '2024/01/01', tags: 'A, B', description: 'Desc', link: 'https://code.example/internal', skip: false }, html: '<p>body</p>' },
	{ slug: 'outside', metadata: { title: 'Outside', date: '2023/01/01', tags: ['C'], description: '', link: 'https://elsewhere.example', skip: true }, html: '' }
];

test('every rendered card appears once, in home order, with canonical links', () => {
	const profile = buildProfile(sections, '/portfolio', markdown);
	assert.deepEqual(profile.map((s) => s.title), ['Talks and Workshops', 'Skills', 'Experience', 'Projects']);
	const [talksOut, skills, experience, projects] = profile;
	// All five cards survive the home page's three-per-page pagination, newest first.
	assert.deepEqual(talksOut.items.map((i) => i.title), ['Talk 5', 'Talk 4', 'Talk 3', 'Talk 2', 'Talk 1']);
	assert.equal(talksOut.items[3].href, '/portfolio/#talks-and-workshops--item-2');
	assert.equal(talksOut.items[0].html, '<p><strong>About</strong> 5</p>\n');
	assert.equal(talksOut.items[0].subtitle, 'Conf');
	// Skill categories keep JSON order even when dated.
	assert.deepEqual(skills.items.map((i) => [i.title, i.tags]), [['B', ['Go']], ['A', ['Rust', 'C']]]);
	// The home page renders inline skip:true cards, so the profile keeps them; owner links get the base path.
	assert.equal(experience.items[0].link, '/portfolio/docs/x.pdf');
	assert.deepEqual(projects.items.map((i) => [i.title, i.href, i.link, i.tags]), [
		['Internal', '/portfolio/projects/internal', 'https://code.example/internal', ['A', 'B']],
		['Outside', 'https://elsewhere.example', undefined, ['C']]
	]);
});

test('root hosting has no base prefix', () => {
	const profile = buildProfile(sections, '', markdown);
	assert.equal(profile[0].items[0].href, '/#talks-and-workshops--item-5');
	assert.equal(profile[3].items[0].href, '/projects/internal');
	assert.equal(profile[2].items[0].link, '/docs/x.pdf');
});

// markdownUtils needs SvelteKit's $app; this is its reading and ordering without image handling.
test('canonical Markdown reader keeps healthy and external-only entries next to a broken file', () => {
	const root = mkdtempSync(join(tmpdir(), 'profile-'));
	const dir = join(root, 'src/content/projects');
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'a.md'), '---\ntitle: Healthy\ndate: 2024/01/01\ntags: X\ndescription: Kept\n---\nBody\n');
	writeFileSync(join(dir, 'b.md'), '---\ntitle: Away\nlink: https://away.example\nskip: true\ndisplay_order: 1\n---\n');
	writeFileSync(join(dir, 'c.md'), '---\ntitle: [broken\n  : : yaml\n---\nBody\n');
	const load = (path) => readContentFolder(root, path).entries.sort(sortByOrderAndDate);
	const [projects] = buildProfile([{ title: 'Projects', type: 'cards_outside', path: 'src/content/projects' }], '/p', load);
	assert.deepEqual(projects.items.map((i) => [i.title, i.href]), [['Away', 'https://away.example'], ['Healthy', '/p/projects/a']]);
});

test('inlineCardIds lists later-page cards but not unknown or unrendered ids', () => {
	const ids = inlineCardIds(sections);
	assert.ok(ids.has('talks-and-workshops--item-5'));
	assert.ok(ids.has('experience--item-1'));
	assert.ok(!ids.has('talks-and-workshops--item-6'));
	assert.ok(!ids.has('talks-and-workshops--item-999'));
	assert.ok(!ids.has('gallery--item-1'));
	assert.ok(!ids.has('projects--item-1'));
});
