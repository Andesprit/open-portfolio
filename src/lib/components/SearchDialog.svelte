<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { searchEntries, type SearchEntry } from '$lib/utils/searchIndex';

	let ready = false;
	let dialog: HTMLDialogElement;
	let entries: SearchEntry[] | undefined;
	let query = '';
	let loading = false;
	let failed = false;
	$: results = searchEntries(entries || [], query);

	onMount(() => {
		ready = true;
	});

	async function openSearch() {
		query = '';
		dialog.showModal();
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
</script>

{#if ready}
	<button class="search-trigger" on:click={openSearch}>Search</button>
{/if}

<dialog bind:this={dialog} aria-labelledby="search-title">
	<div class="dialog-heading">
		<h2 id="search-title">Search portfolio</h2>
		<button on:click={() => dialog.close()} aria-label="Close search">Close</button>
	</div>
	<label for="portfolio-search">Search projects, posts and more</label>
	<input id="portfolio-search" type="search" bind:value={query} placeholder="Try TypeScript" />
	{#if loading}
		<p role="status">Loading search…</p>
	{:else if failed}
		<p role="alert">
			Search could not load. Close and reopen to try again, or browse the sections.
		</p>
	{:else if query.trim() && !results.length}
		<p role="status">No matches for "{query}". Try another word or browse the sections.</p>
	{:else if results.length}
		<ul>
			{#each results as result}
				<li>
					<a href={result.href} on:click={() => dialog.close()}>
						<strong>{result.title}</strong>
						<small>{result.section}</small>
						{#if result.text}<span>{result.text.slice(0, 160)}</span>{/if}
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
		background: var(--card-background);
		border: 1px solid var(--text-secondary-color);
		border-radius: 8px;
		padding: 8px 12px;
		cursor: pointer;
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
	span {
		display: block;
		margin-top: 4px;
		color: var(--text-secondary-color);
	}
</style>
