import { copyText } from './contactUtils';

// Svelte action: adds a Copy code button above each <pre><code> block in an article.
// Pass the article html so the buttons are rebuilt when the article changes.
export function codeCopy(node: HTMLElement, _html?: string) {
	const add = () => {
		for (const pre of node.querySelectorAll('pre')) {
			const code = pre.querySelector('code');
			if (!code) continue;
			const bar = document.createElement('div');
			bar.className = 'code-copy';
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'code-copy-button';
			button.textContent = 'Copy code';
			const status = document.createElement('span');
			status.className = 'code-copy-status';
			status.setAttribute('role', 'status');
			button.addEventListener('click', async () => {
				// Clear every block's status so only the latest action reports a result.
				node.querySelectorAll('.code-copy-status').forEach((other) => (other.textContent = ''));
				status.textContent = (await copyText(code.textContent ?? ''))
					? 'Copied'
					: 'Copy failed. Select the code below and copy it by hand.';
			});
			bar.append(button, status);
			pre.before(bar);
		}
	};
	const remove = () => node.querySelectorAll('.code-copy').forEach((bar) => bar.remove());
	add();
	return {
		update() {
			remove();
			add();
		},
		destroy: remove
	};
}
