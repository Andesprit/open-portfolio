<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let availableTags: string[] = [];
	export let itemsPerPage: number = 3;
	export let truncationLimit: number = 150;
	
	import { base } from '$app/paths';
	import { fadeIn } from '$lib/utils/fadeInUtils';

	import SearchableDropdown from '$lib/components/common/TagSearch.svelte';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';
	import Pagination from '$lib/components/common/Pagination.svelte';

	import '/src/styles/cards.css';
	import '/src/styles/cards-outside.css';

	let currentPage = 1;
	let selectedTags: string[] = [];

	// Filter items based on the selected tags, return all items if no tags are selected.
	$: filteredItems =
		selectedTags.length > 0
			? items.filter(
					(item) =>
						Array.isArray(item.metadata?.tags) &&
						selectedTags.every((selectedTag) =>
							item.metadata.tags
								.map((t: string) => t.toLowerCase())
								.includes(selectedTag.toLowerCase())
						)
				)
			: items;

	$: totalPages = Math.ceil(filteredItems.length / itemsPerPage);
	$: paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	// Reset the current page when the tags change
	$: if (selectedTags) {
		currentPage = 1;
	}

	// This function will be passed as the onPageChange prop to Pagination
	function handlePageChange(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
		}
	}

	function handleTagChange(newTagValues: string[]) {
		selectedTags = newTagValues;
	}

	function getItemUrl(item: any) {
		if (item.metadata?.skip) {
			return item.metadata.link;
		}
		// Convert sectionId to the same format used in route generation
		const routeType = sectionTitle.toLowerCase().replace(/\s+/g, '-');
		return `${base}/${routeType}/${item.slug}`;
	}
</script>

<section
	id={sectionTitle.toLowerCase().replace(/\s+/g, '-')}
	class="section slug-section"
	use:fadeIn
>
	<h2 class="section-title">{sectionTitle}</h2>
	{#if availableTags.length > 0}
		<div class="tag-filter">
			<SearchableDropdown
				options={availableTags}
				value={selectedTags}
				onChange={handleTagChange}
				placeholder="Search tags..."
			/>
		</div>
	{/if}

	{#each paginatedItems as item, index (`${item.title || 'untitled'}-${index}`)}
		<a
			class="timeline-content"
			href={getItemUrl(item)}
			target={item.metadata?.skip ? '_blank' : null}
			rel={item.metadata?.skip ? 'noopener noreferrer' : null}
		>
			<div class="header-container">
				{#if item.metadata?.date}
					<span class="date">{item.metadata.date}</span>
				{/if}
				{#if item.metadata?.tags}
					<div class="tags-container">
						{#each Array.isArray(item.metadata.tags) ? item.metadata.tags : item.metadata.tags
									.split(/[\s,]+/)
									.map((t: string): string => t.trim()) as tag}
							<span class="card-tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
			<div class="card-container">
				{#if item.metadata?.image}
					<div class="card-image">
						<img
							src={item.metadata.image}
							alt={item.metadata?.title ? `${item.metadata.title} image` : 'Card image'}
							loading="lazy"
						/>
					</div>
				{/if}
				<div class="details">
						<h3 class="title-ref">{item.metadata?.title}</h3>
					{#if item.metadata?.description}
						<p class="description">
							<TruncatedMarkdown text={item.metadata.description} limit={truncationLimit} />
						</p>
					{/if}
				</div>
			</div>
		</a>
	{/each}
	<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
</section>
