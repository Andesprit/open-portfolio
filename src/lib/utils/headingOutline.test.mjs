import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { articlePassages, createHeadingOutline, PAGE_IDS } from './headingOutline.ts';

function render(markdown, headings = createHeadingOutline()) {
	const marked = new Marked(
		markedHighlight({ langPrefix: 'hljs language-', highlight: (code, lang) => hljs.highlight(code, { language: lang }).value })
	);
	marked.use(headings.extension);
	const html = marked.parse(markdown);
	return { html, outline: headings.outline() };
}
const ids = (html) => [...html.matchAll(/<h\d id="([^"]*)"/g)].map((m) => m[1]);

test('duplicate, suffix-colliding, punctuation and reserved headings get unique ids', () => {
	const { html } = render('## Intro\n## Intro-2\n## Intro\n## !!!\n## ???\n## Contact\n## About');
	assert.deepEqual(ids(html), ['intro', 'intro-2', 'intro-3', 'section', 'section-2', 'contact-2', 'about-2']);
});

test('ids keep Unicode letters and ignore formatting, entities and NBSP', () => {
	const { html, outline } = render(
		'## Café &amp; Résumé\n## 日本語の見出し\n## Привет мир\n## 🎨 **Theme** `code()`\n## A&nbsp;B&#160;C&#x41;\n## Tom &quot;&#39;s&quot;'
	);
	assert.deepEqual(ids(html), ['café-résumé', '日本語の見出し', 'привет-мир', 'theme-code', 'a-b-ca', 'tom-s']);
	assert.deepEqual(
		outline.map((e) => e.text),
		['Café & Résumé', '日本語の見出し', 'Привет мир', '🎨 Theme code()', 'A B CA', 'Tom "\'s"']
	);
});

test('inline formatting stays in the heading and labels are escaped in the permalink', () => {
	const { html, outline } = render('## Use *this* and [docs](https://example.com) "now" <b>&lt;x&gt;</b>');
	assert.match(html, /<em>this<\/em> and <a href="https:\/\/example.com">docs<\/a>/);
	assert.match(html, /aria-label="Link to section: Use this and docs &quot;now&quot; &lt;x&gt;"/);
	assert.equal(outline[0].text, 'Use this and docs "now" <x>');
});

test('authored HTML ids are not reused by headings and authored links stay intact', () => {
	const { html } = render('<div id="setup">custom</div>\n\n## Setup\n\n[jump](#setup)');
	assert.deepEqual(ids(html), ['setup-2']);
	assert.match(html, /<div id="setup">custom<\/div>/);
	assert.match(html, /<a href="#setup">jump<\/a>/);
});

test('repeated parses with one instance produce identical ids and outline', () => {
	const headings = createHeadingOutline();
	const first = render('## A\n## A', headings);
	const second = render('## A\n## A', headings);
	assert.deepEqual(second, first);
	assert.deepEqual(ids(second.html), ['a', 'a-2']);
});

test('outline nests the two shallowest levels, including leading and skipped levels', () => {
	const { outline } = render('### Lead\n## One\n#### Deep\n### Sub\n## Two\n### Sub');
	assert.deepEqual(outline, [
		{ id: 'lead', text: 'Lead', children: [] },
		{ id: 'one', text: 'One', children: [{ id: 'sub', text: 'Sub' }] },
		{ id: 'two', text: 'Two', children: [{ id: 'sub-2', text: 'Sub' }] }
	]);
	assert.deepEqual(render('## A\n#### B').outline, [{ id: 'a', text: 'A', children: [{ id: 'b', text: 'B' }] }]);
});

test('no headings means no outline; code highlighting and images are preserved', () => {
	const { html, outline } = render('Text ![alt](pic.png)\n\n```js\nconst a = 1;\n```');
	assert.deepEqual(outline, []);
	assert.match(html, /<img src="pic.png" alt="alt">/);
	assert.match(html, /class="hljs language-js"/);
	assert.match(html, /<span class="hljs-keyword">const<\/span>/);
});

test('PAGE_IDS covers every static id rendered by components and routes', () => {
	const files = (dir) =>
		readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
			e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.svelte') ? [join(dir, e.name)] : []
		);
	const found = files('src')
		.flatMap((f) => [...readFileSync(f, 'utf-8').matchAll(/\bid="([^"{]+)"/g)].map((m) => m[1]));
	assert.ok(found.length > 0);
	for (const id of found) assert.ok(PAGE_IDS.includes(id), `${id} missing from PAGE_IDS`);
});

test('article passages use the same ids as the rendered article and keep only their own text', () => {
	const markdown = [
		'Lead text before any heading.',
		'## Intro',
		'Intro body.',
		'### Café & **Résumé**',
		'Nested body.',
		'## Intro',
		'Second intro.',
		'## Contact',
		'```js\nconst value = "<b>x</b>";\n```',
		'## Empty'
	].join('\n\n');
	const passages = articlePassages(markdown);
	assert.deepEqual(
		passages.map((p) => p.id),
		[undefined, ...ids(render(markdown).html)]
	);
	assert.deepEqual(passages, [
		{ text: 'Lead text before any heading.' },
		{ id: 'intro', heading: 'Intro', text: 'Intro body.' },
		{ id: 'café-résumé', heading: 'Café & Résumé', text: 'Nested body.' },
		{ id: 'intro-2', heading: 'Intro', text: 'Second intro.' },
		{ id: 'contact-2', heading: 'Contact', text: 'const value = "<b>x</b>";' },
		{ id: 'empty', heading: 'Empty', text: '' }
	]);
	assert.deepEqual(articlePassages('Just **one** paragraph with `code`.'), [{ text: 'Just one paragraph with code.' }]);
	assert.deepEqual(articlePassages(''), []);
});
