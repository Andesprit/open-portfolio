import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// codeCopy.ts uses an extensionless sibling import, which only Vite resolves.
registerHooks({
	resolve(specifier, context, next) {
		try {
			return next(specifier, context);
		} catch (error) {
			if (specifier.startsWith('.') && !/\.\w+$/.test(specifier))
				return next(`${specifier}.ts`, context);
			throw error;
		}
	}
});
const { codeCopy } = await import('./codeCopy.ts');

// Just enough DOM for the action: an article with two code blocks.
const bars = [];
globalThis.document = {
	createElement: () => ({
		children: [],
		textContent: '',
		setAttribute() {},
		append(...children) {
			this.children.push(...children);
		},
		addEventListener(_type, listener) {
			this.click = listener;
		}
	})
};
const pres = ['first()', 'second()'].map((text) => ({
	querySelector: () => ({ textContent: text }),
	before: (bar) => bars.push(bar)
}));
const article = {
	querySelectorAll: (selector) => (selector === 'pre' ? pres : bars.map((bar) => bar.children[1]))
};

test('a slow earlier copy does not report over a later one', async () => {
	const writes = [];
	Object.defineProperty(globalThis.navigator, 'clipboard', {
		configurable: true,
		value: { writeText: (text) => new Promise((resolve) => writes.push({ text, resolve })) }
	});
	codeCopy(article);
	const [first, second] = bars.map((bar) => bar.children[0].click());
	writes[1].resolve();
	await second;
	writes[0].resolve();
	await first;
	assert.deepEqual(
		writes.map((write) => write.text),
		['first()', 'second()']
	);
	assert.deepEqual(
		bars.map((bar) => bar.children[1].textContent),
		['', 'Copied']
	);
});
