<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { cardTargetEvent } from '$lib/utils/cardTarget';
	import { searchEntries, type SearchEntry } from '$lib/utils/searchIndex';
	export let onOpen: () => void = () => {};

	let ready = false;
	let dialog: HTMLDialogElement;
	let trigger: HTMLButtonElement;
	let searchInput: HTMLInputElement;
	let entries: SearchEntry[] | undefined;
	let query = '';
	let loading = false;
	let failed = false;
	let activeIndex = -1;
	let returnFocus = true;
	$: results = searchEntries(entries || [], query);

	onMount(() => {
		ready = true;
	});

	async function openSearch() {
		onOpen();
		returnFocus = true;
		query = '';
		activeIndex = -1;
		dialog.showModal();
		searchInput.focus();
		if (entries) return;
		loading = true;
		failed = false;
		try {
			const response = await fetch(`${base}/search-index.json`);
			if (!response.ok) throw new Error('Search index unavailable');
			entries = await response.json();
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	function handleShortcut(event: KeyboardEvent) {
		const target = event.target;
		if (
			event.defaultPrevented ||
			event.repeat ||
			dialog?.open ||
			event.altKey ||
			(target instanceof Element &&
				target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))
		)
			return;
		if (
			(event.key === '/' && !event.ctrlKey && !event.metaKey) ||
			(event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))
		) {
			event.preventDefault();
			void openSearch();
		}
	}

	async function chooseResult(event: MouseEvent, result: SearchEntry) {
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)
			return;
		returnFocus = false;
		dialog.close();
		if (!result.targetId) return;
		event.preventDefault();
		await goto(result.href, { noScroll: true, keepFocus: true });
		// Also reveal repeated selections when the URL hash has not changed.
		window.dispatchEvent(new Event(cardTargetEvent));
	}

	function handleResultKeys(event: KeyboardEvent) {
		if (event.key === 'Escape' && !event.isComposing) {
			event.preventDefault();
			dialog.close();
			return;
		}
		if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey) {
			const stops = dialog.querySelectorAll<HTMLElement>(
				'button:not(:disabled), input:not(:disabled), a[tabindex="0"]'
			);
			const first = stops[0];
			const last = stops[stops.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
			return;
		}
		const target = event.target as Element;
		if (target !== searchInput && !target.closest('.search-result')) return;
		const links = dialog.querySelectorAll<HTMLAnchorElement>('.search-result');
		if (!links.length || event.isComposing) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const direction = event.key === 'ArrowDown' ? 1 : -1;
			activeIndex =
				activeIndex < 0
					? direction === 1
						? 0
						: links.length - 1
					: (activeIndex + direction + links.length) % links.length;
			links[activeIndex].focus();
		} else if (event.key === 'Enter' && target === searchInput) {
			event.preventDefault();
			links[Math.max(0, activeIndex)].click();
		}
	}
</script>

<svelte:window on:keydown={handleShortcut} />

{#if ready}
	<button bind:this={trigger} class="search-trigger" on:click={openSearch} aria-haspopup="dialog"
		>Search</button
	>
{/if}

<dialog
	bind:this={dialog}
	aria-labelledby="search-title"
	on:keydown={handleResultKeys}
	on:close={() => {
		if (returnFocus) trigger?.focus({ preventScroll: true });
	}}
>
	<div class="dialog-heading">
		<h2 id="search-title">Search portfolio</h2>
		<button on:click={() => dialog.close()} aria-label="Close search">Close</button>
	</div>
	<label for="portfolio-search">Search projects, posts and more</label>
	<input
		bind:this={searchInput}
		id="portfolio-search"
		type="search"
		bind:value={query}
		on:input={() => (activeIndex = -1)}
		on:focus={() => (activeIndex = -1)}
		placeholder="Try TypeScript"
		aria-describedby="search-help"
	/>
	<p id="search-help" class="search-help">↑ ↓ to choose · Enter to open · Esc to close</p>
	{#if loading}
		<p role="status">Loading search…</p>
	{:else if failed}
		<p role="alert">
			Search could not load. Close and reopen to try again, or browse the sections.
		</p>
	{:else if query.trim() && !results.length}
		<p role="status">No matches for "{query}". Try another word or browse the sections.</p>
	{:else if results.length}
		<p role="status">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
		<ul>
			{#each results as result, index}
				<li>
					<a
						class="search-result"
						href={result.href}
						tabindex={index === Math.max(0, activeIndex) ? 0 : -1}
						on:focus={() => (activeIndex = index)}
						on:click={(event) => chooseResult(event, result)}
					>
						<strong>{result.title}</strong>
						<small>{result.heading ? `${result.section} · ${result.heading}` : result.section}</small>
						{#if result.excerpt || result.text}<span>{result.excerpt || result.text.slice(0, 160)}</span>{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Type a title, topic or skill to find it in this portfolio.</p>
	{/if}
</dialog>

<style>
	button,
	input {
		font: inherit;
		color: var(--text-color);
	}
	button {
		min-height: 44px;
		background: var(--card-background);
		border: 1px solid var(--text-secondary-color);
		border-radius: 8px;
		padding: 8px 12px;
		cursor: pointer;
	}
	.search-trigger {
		flex-shrink: 0;
	}
	dialog {
		width: min(600px, calc(100% - 32px));
		max-height: 80vh;
		box-sizing: border-box;
		padding: 24px;
		border: 1px solid var(--text-secondary-color);
		border-radius: 12px;
		background: var(--background-color);
		color: var(--text-color);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
	}
	.dialog-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
	}
	h2 {
		margin: 0;
	}
	label {
		display: block;
		margin-bottom: 8px;
	}
	input {
		width: 100%;
		box-sizing: border-box;
		padding: 12px;
		background: var(--card-background);
		border: 1px solid var(--text-secondary-color);
		border-radius: 8px;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	a {
		display: block;
		padding: 12px;
		color: var(--text-color);
		text-decoration: none;
		border-bottom: 1px solid var(--text-secondary-color);
	}
	a:hover,
	a:focus-visible {
		background: var(--card-background);
	}
	small,
	span,
	.search-help {
		display: block;
		margin-top: 4px;
		color: var(--text-secondary-color);
	}
</style>
