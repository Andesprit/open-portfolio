<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	export let status = 404;
	$: notFound = status === 404;
	$: title = notFound ? 'Page not found' : 'Something went wrong';
</script>

<svelte:head>
	<title>{title} | {$page.data.portfolioData?.settings?.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error-page" aria-labelledby="error-title">
	<p class="status">{status}</p>
	<h1 id="error-title">{title}</h1>
	<p>
		{notFound
			? 'This page may have moved, or the link may be incorrect. You can find projects and posts on the home page.'
			: 'We could not load this page. Please try again, or return to the home page.'}
	</p>
	<a href="{base}/">Back to home</a>
</main>

<style>
	.error-page {
		max-width: 640px;
		margin: 120px auto;
		padding: 24px;
		line-height: 1.75;
	}

	.status {
		color: var(--text-secondary-color);
	}

	h1 {
		color: var(--text-color);
		background: none;
		-webkit-text-fill-color: currentColor;
		font-size: 2rem;
		line-height: 1.25;
	}

	a {
		display: inline-block;
		margin-top: 16px;
		text-decoration: underline;
	}
</style>
