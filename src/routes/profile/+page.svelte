<script lang="ts">
	import { base } from '$app/paths';
	import { marked } from 'marked';
	import { getAbsoluteLink } from '$lib/utils/linkUtils';
	import { emailAddress, findSocial, mailtoHref } from '$lib/utils/contactUtils';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ portfolioData, profile } = data);
	$: settings = portfolioData.settings;
	$: email = findSocial(portfolioData.social, 'email');
	$: others = portfolioData.social.filter((s) => s !== email && s.link?.trim());
</script>

<svelte:head>
	<title>Profile | {settings.name}</title>
</svelte:head>

<main class="profile">
	<header>
		<h1>{settings.name}</h1>
		{#if settings.title}<p class="role">{settings.title}</p>{/if}
		<ul class="contact">
			{#if email}<li><a href={mailtoHref(email.link)}>{emailAddress(email.link)}</a></li>{/if}
			{#each others as social}
				<li>{social.name}: <a href={getAbsoluteLink(social.link, base)}>{getAbsoluteLink(social.link, base)}</a></li>
			{/each}
		</ul>
		{#if settings.bio}<div class="bio">{@html marked.parse(settings.bio)}</div>{/if}
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
					{#if item.link}<p class="link"><a href={item.link}>{item.link}</a></p>{/if}
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
	h1 { margin: 0; }
	.role { margin: 0.2rem 0 0.5rem; font-weight: 600; }
	.contact { list-style: none; padding: 0; margin: 0 0 0.5rem; display: flex; flex-wrap: wrap; gap: 0 1.25rem; }
	h2 { margin: 1.25rem 0 0.4rem; border-bottom: 1px solid currentColor; }
	article { margin: 0 0 0.6rem; break-inside: avoid; }
	h3 { margin: 0; font-size: 1.05rem; }
	.meta, .tags, .link { margin: 0; font-size: 0.9rem; }
	.desc :global(p) { margin: 0.15rem 0; }
	a { overflow-wrap: anywhere; }

	@media print {
		@page { margin: 14mm; }
		:global(html), :global(body) { background: #fff !important; color: #000 !important; }
		:global(.navigation), :global(footer) { display: none !important; }
		.profile { max-width: none; padding: 0; font-size: 10.5pt; color: #000; }
		.profile * { color: #000 !important; }
		h1 { font-size: 18pt; }
		h2 { font-size: 13pt; break-after: avoid; }
		h3 { font-size: 11pt; }
		.meta, .tags, .link { font-size: 10pt; }
		a { text-decoration: none; }
	}
</style>
