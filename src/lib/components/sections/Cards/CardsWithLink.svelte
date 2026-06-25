<script lang="ts">
	export let sectionTitle: string;
	export let items: any[];
	export let itemsPerPage: number = 3;
	export let truncationLimit: number = 150;

	import { fadeIn } from '$lib/utils/fadeInUtils';
	import Pagination from '$lib/components/common/Pagination.svelte';
	import TruncatedMarkdown from '$lib/components/common/TruncatedMarkdown.svelte';

	import '/src/styles/cards.css';
	import '/src/styles/cards-with-link.css';

	let currentPage = 1;

	$: totalPages = Math.ceil(items.length / itemsPerPage);
	$: paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	function handlePageChange(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
		}
	}
</script>

<section id={sectionTitle.toLowerCase()} class="section" use:fadeIn>
	<h2 class="section-title">{sectionTitle}</h2>
	{#each paginatedItems as item, index (`${item.title || 'untitled'}-${index}`)}
		<div class="timeline-content">
			<div class="details">
				<span class="date">{item.date}</span>
				{#if item?.icon}
					<div class="timeline-header">
						<div class="timeline-icon">
							<img src={item.icon} alt="" />
						</div>
						<div class="timeline-title with-icon">
							<div class="title-wrapper">
								<a href={item.link} target="_blank" rel="noopener noreferrer" class="hover-link">
									{#if item.organization}
										<h3 class="entity">{item.organization}</h3>
									{/if}
								</a>
								<span class="separator">|</span>
								<h3 class="title">
									{item.title}
								</h3>
							</div>
						</div>
					</div>
				{:else}
					<div class="timeline-title without-icon">
						<div class="title-wrapper">
							<a href={item.link} target="_blank" rel="noopener noreferrer" class="hover-link">
								{#if item.organization}
									<h3 class="entity">{item.organization}</h3>
								{/if}
							</a>
							<span class="separator">|</span>
							<h3 class="title">
								{item.title}
							</h3>
						</div>
					</div>
				{/if}
				{#if item.description}
					<TruncatedMarkdown text={item.description} limit={truncationLimit} />
				{/if}
			</div>
		</div>
	{/each}
	<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
</section>
