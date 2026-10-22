import { tick } from 'svelte';

export const cardTargetEvent = 'portfolio-card-target';

interface CardTargets {
	ids: string[];
	itemsPerPage?: number;
	selectPage?: (page: number) => void;
}

// IDs are assigned before sorting, while this list follows the rendered order.
export function followCardTarget(section: HTMLElement, options: CardTargets) {
	let generation = 0;
	let timer: ReturnType<typeof setTimeout>;
	let highlighted: HTMLElement | null = null;

	async function reveal() {
		let id: string;
		try {
			id = decodeURIComponent(window.location.hash.slice(1));
		} catch {
			return;
		}
		if (!id) return;
		const index = options.ids.indexOf(id);
		if (index < 0) return;
		const current = ++generation;
		if (options.itemsPerPage) options.selectPage?.(Math.floor(index / options.itemsPerPage) + 1);
		await tick();
		if (current !== generation) return;
		const card = document.getElementById(id);
		if (!card || !section.contains(card)) return;
		clearTimeout(timer);
		highlighted?.classList.remove('search-target');
		highlighted = card;
		card.classList.add('search-target');
		card.focus({ preventScroll: true });
		card.scrollIntoView({ block: 'start', behavior: 'instant' });
		timer = setTimeout(() => card.classList.remove('search-target'), 3000);
	}

	window.addEventListener('hashchange', reveal);
	window.addEventListener(cardTargetEvent, reveal);
	void reveal();
	return {
		update(next: CardTargets) {
			options = next;
			void reveal();
		},
		destroy() {
			generation++;
			clearTimeout(timer);
			highlighted?.classList.remove('search-target');
			window.removeEventListener('hashchange', reveal);
			window.removeEventListener(cardTargetEvent, reveal);
		}
	};
}
