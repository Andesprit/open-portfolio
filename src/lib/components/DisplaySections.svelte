<script lang="ts">
	import type { PortfolioData, PageData } from '../types/types.js';
	import CardsOutside from '$lib/components/sections/Cards/CardsOutside.svelte';
	import CardsWithLink from './sections/Cards/CardsWithLink.svelte';
	import Cards from './sections/Cards/Cards.svelte';
	import CardsWithIcons from '$lib/components/sections/Cards/CardsWithIcons.svelte';
	import { sortItemsByDate, shouldSortSectionByDate } from '$lib/utils/dateSortUtils';
	import { inlineItemId } from '$lib/utils/searchIndex';

	export let portfolioData: PortfolioData;
	export let content: PageData['content'];

	// Extract the pagination setting
	$: itemsPerPage = portfolioData.settings?.cards_before_pagination || 3;

	// Function to get sorted items for a section
	function getSortedItems(section: any, sortByDate = true): any[] {
		if (!section.content) return [];
		const items = section.content.map((item: any, index: number) => ({ ...item, searchId: inlineItemId(section.title, index) }));

		// Only sort if the section has items with date fields
		if (sortByDate && shouldSortSectionByDate(section)) {
			return sortItemsByDate(items);
		}

		return items;
	}
</script>

{#each portfolioData.sections.filter((section) => typeof section.title === 'string' && section.title.trim()) as section}
	{#if section.type === 'cards_with_link'}
		<CardsWithLink
			sectionTitle={section.title}
			items={getSortedItems(section)}
			{itemsPerPage}
			truncationLimit={section.truncation_limit || 150}
		/>
	{:else if section.type === 'cards_with_icons'}
		<CardsWithIcons title={section.title} skillsData={getSortedItems(section, false)} />
	{:else if section.type === 'cards'}
		<Cards
			sectionTitle={section.title}
			items={getSortedItems(section)}
			{itemsPerPage}
			truncationLimit={section.truncation_limit || 150}
		/>
	{:else if section.type === 'cards_outside'}
		<CardsOutside
			sectionTitle={section.title}
			items={content[section.title.toLowerCase()]?.content || []}
			availableTags={content[section.title.toLowerCase()]?.tags || []}
			{itemsPerPage}
			truncationLimit={section.truncation_limit || 150}
		/>
	{/if}
{/each}
