<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/themeStore';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import '../styles/global.css';
	import Navbar from '../lib/components/NavBar.svelte';
	import Footer from '../lib/components/Footer.svelte';
	export let data: LayoutData;
	$: portfolioData = data.portfolioData;
	$: isErrorPage = Boolean($page.error) || $page.route.id === '/404';

	onMount(() => {
		// Theme is already applied by blocking script, just sync the store
		theme.init(portfolioData.settings?.theme || 'light');

		const handleHashChange = () => {
			const hash = window.location.hash;
			const currentPath = window.location.pathname;

			// Check if we're on a detail page (dynamic [type]/[slug] route)
			// This matches any path that follows the pattern: /content-type/content-slug
			const isDetailPage =
				currentPath !== '/' && currentPath.split('/').filter(Boolean).length === 2;

			if (hash && !isDetailPage) {
				requestAnimationFrame(() => {
					// Ids such as Unicode heading slugs arrive percent-encoded and are not valid selectors.
					let element: HTMLElement | null = null;
					try {
						element = document.getElementById(decodeURIComponent(hash.slice(1)));
					} catch {
						return;
					}
					if (element) {
						element.scrollIntoView({ behavior: 'smooth' });
					}
				});
			}
		};

		if (window.location.hash) {
			setTimeout(handleHashChange, 50);
		}

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	});
</script>

<svelte:head>
	<!-- Pass portfolio theme to the blocking script -->
	<meta name="portfolio-theme" content={portfolioData.settings?.theme || 'light'} />
</svelte:head>

{#if import.meta.env.DEV}
	{#await import('$lib/components/ConfigNotice.svelte') then { default: ConfigNotice }}
		<ConfigNotice warnings={data?.configWarnings || []} />
	{/await}
{/if}

{#if !isErrorPage}
	<Navbar {portfolioData} />
{/if}
<slot />
{#if !isErrorPage}
	<Footer {portfolioData} />
{/if}
