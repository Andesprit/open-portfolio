<script lang="ts">
	import { marked } from 'marked';
	import { markdownPreview } from '$lib/utils/markdownPreview';

	export let text: string;
	export let className: string = '';
	export let limit: number;

	let isExpanded = false;
	$: preview = markdownPreview(text, limit);
	$: htmlContent = isExpanded ? marked.parse(text || '', { async: false }) : preview.html;

	function toggleExpanded(event: MouseEvent) {
		event.preventDefault();
		isExpanded = !isExpanded;
	}
</script>

{#if text && text.trim()}
	<div class="markdown-content {className}" class:has-toggle={preview.truncated}>
		{@html htmlContent}
		{#if preview.truncated}
			<button class="show-more-btn" type="button" aria-expanded={isExpanded} on:click={toggleExpanded}>
				{isExpanded ? 'Show less' : 'Show more'}
			</button>
		{/if}
	</div>
{/if}

<style>
	.markdown-content {
		/* Use contents to not interfere with parent layout */
		display: contents;
	}

	.has-toggle :global(> p:last-of-type) {
		display: inline;
	}

	.markdown-content :global(.show-more-btn) {
		background: none;
		border: none;
		color: var(--accent-color, #007acc);
		cursor: pointer;
		font-size: inherit;
		text-decoration: underline;
		padding: 0;
		margin: 0;
		transition: opacity 0.2s ease;
		display: inline;
		font-family: inherit;
		line-height: inherit;
	}

	.markdown-content :global(.show-more-btn:hover) {
		opacity: 0.8;
	}

	.markdown-content :global(p:last-of-type) {
		margin-right: 20px;
	}

	.markdown-content :global(p) {
		margin: 0 0 0.5em 0;
	}

	.markdown-content :global(p:last-of-type) {
		margin-bottom: 0;
	}

	.markdown-content :global(ul) {
		margin: 0 0 0.5em 0;
		padding-left: 1.2em;
	}

	.markdown-content :global(ol) {
		margin: 0 0 0.5em 0;
		padding-left: 1.2em;
	}

	.markdown-content :global(ul:last-child) {
		margin-bottom: 0;
	}

	.markdown-content :global(ol:last-child) {
		margin-bottom: 0;
	}
</style>
