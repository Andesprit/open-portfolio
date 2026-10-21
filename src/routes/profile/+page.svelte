<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { getAbsoluteLink } from '$lib/utils/linkUtils';
	import { emailAddress, findSocial, mailtoHref } from '$lib/utils/contactUtils';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ portfolioData, profile, bio } = data);
	$: settings = portfolioData.settings;
	$: email = findSocial(portfolioData.social, 'email');
	$: others = portfolioData.social.filter((s) => s !== email && s.link?.trim());

	let canPrint = false;
	let printHelp = '';
	// Printed pages should show a full address; the site address is only known in the browser.
	let pageUrl = '';
	onMount(() => {
		canPrint = true;
		pageUrl = location.href;
	});
	$: shown = (href: string) => (pageUrl ? new URL(href, pageUrl).href : href);

	function printProfile() {
		printHelp = '';
		try {
			if (typeof window.print !== 'function') throw new Error('print unavailable');
			window.print();
		} catch {
			printHelp =
				'This browser did not open its print window. Open the browser menu, choose Print, then pick "Save as PDF" as the destination to keep a copy.';
		}
	}
</script>

<svelte:head>
	<title>Profile | {settings.name}</title>
</svelte:head>

<main class="profile">
	<div class="toolbar">
		<a href="{base}/">Back to portfolio</a>
		{#if canPrint}<button type="button" on:click={printProfile}>Print or save as PDF</button>{/if}
		<p class="help">To keep a copy, use your browser's Print command (Ctrl+P or Cmd+P) and choose "Save as PDF".</p>
		{#if printHelp}<p class="help" role="status">{printHelp}</p>{/if}
	</div>

	<header>
		<h1>{settings.name}</h1>
		{#if settings.title}<p class="role">{settings.title}</p>{/if}
		<ul class="contact">
			{#if email}<li><a href={mailtoHref(email.link)}>{emailAddress(email.link)}</a></li>{/if}
			{#each others as social}
				<li>{social.name}: <a href={getAbsoluteLink(social.link, base)}>{shown(getAbsoluteLink(social.link, base))}</a></li>
			{/each}
		</ul>
		{#if bio}<div class="bio">{@html bio}</div>{/if}
		{#if settings.expertises?.length}<p class="tags">{settings.expertises.join(' · ')}</p>{/if}
	</header>

	{#each profile as section}
		<section>
			<h2>{section.title}</h2>
			{#each section.items as item}
				<article>
					<h3><a href={item.href}>{item.title}</a></h3>
					{#if item.subtitle || item.date}
						<p class="meta">{[item.subtitle, item.date].filter(Boolean).join(' · ')}</p>
					{/if}
					{#if item.html}<div class="desc">{@html item.html}</div>{/if}
					{#if item.tags.length}<p class="tags">{item.tags.join(' · ')}</p>{/if}
					{#if item.link}<p class="link"><a href={item.link}>{shown(item.link)}</a></p>{/if}
				</article>
			{/each}
		</section>
	{/each}
</main>

<style>
	.profile {
		max-width: 52rem;
		margin: 0 auto;
		padding: 8rem 1rem 3rem;
		line-height: 1.45;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
		margin-bottom: 1.5rem;
	}
	.toolbar a,
	.toolbar button {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}
	.toolbar button {
		padding: 0 1rem;
		border-radius: 22px;
		background: var(--tag-background);
		border: var(--tag-border);
		color: var(--text-color);
		font: inherit;
		cursor: pointer;
	}
	.help { flex-basis: 100%; margin: 0; font-size: 0.9rem; }
	h1 { margin: 0; }
	.role { margin: 0.2rem 0 0.5rem; font-weight: 600; }
	.contact { list-style: none; padding: 0; margin: 0 0 0.5rem; display: flex; flex-wrap: wrap; gap: 0 1.25rem; }
	h2 { margin: 1.25rem 0 0.4rem; border-bottom: 1px solid currentColor; }
	article { margin: 0 0 0.6rem; }
	h3 { margin: 0; font-size: 1.05rem; }
	.meta, .tags, .link { margin: 0; font-size: 0.9rem; }
	.desc :global(p) { margin: 0.15rem 0; }
	a { overflow-wrap: anywhere; }

	@media print {
		@page { margin: 14mm; }
		/* Scoped to pages that contain the profile: this stylesheet stays loaded after client navigation. */
		:global(html:has(main.profile)),
		:global(body:has(main.profile)) { background: #fff !important; color: #000 !important; }
		:global(body:has(main.profile) .navigation),
		:global(body:has(main.profile) footer) { display: none !important; }
		.toolbar { display: none; }
		.profile { max-width: none; padding: 0; font-size: 10.5pt; color: #000; }
		.profile :global(*) { color: #000 !important; }
		h1 { font-size: 18pt; }
		h2 { font-size: 13pt; break-after: avoid; }
		h3 { font-size: 11pt; break-after: avoid; }
		/* Short entries stay whole; one longer than a page still flows across pages. */
		article { break-inside: avoid-page; }
		.meta, .tags, .link { font-size: 10pt; }
		a { text-decoration: none; }
	}
</style>
