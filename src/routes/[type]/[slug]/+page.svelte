<script lang="ts">
	import type { PageData } from './$types';
	import { base } from '$app/paths';
	import '/src/styles/slug-page.css';

	export let data: PageData;
	$: sectionTitle = data.portfolioData.sections.find(
		(section) => section.title.toLowerCase().replace(/\s+/g, '-') === data.type
	)?.title || data.type;
</script>

<svelte:head>
	<title>{data.metadata.title} | {data.portfolioData.settings.name}</title>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css"
	/>
</svelte:head>

<div class="slug-page-container">
	<article class="slug-article">
		<a class="back-link" href="{base}/#{data.type}">← Back to {sectionTitle}</a>
		<header>
			<h1>{data.metadata.title}</h1>
			<div class="metadata">
				<time datetime={data.metadata.date}>{data.metadata.date}</time>
				<div class="tags">
					{#each Array.isArray(data.metadata.tags) ? data.metadata.tags : data.metadata.tags
								.split(',')
								.map((tag: string) => tag.trim()) as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</div>
		</header>
		{#if data.metadata.image}
			<img src={data.metadata.image} alt={data.metadata.title} />
		{/if}
		<div class="content">
			{@html data.html}
		</div>
		{#if data.nextItem}
			<div class="next-navigation">
				<a href="{base}/{data.nextItem.type}/{data.nextItem.slug}" class="next-button">
					Next: {data.nextItem.title}
					<span class="arrow">→</span>
				</a>
			</div>
		{/if}
	</article>
</div>

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		text-decoration: underline;
	}
</style>
