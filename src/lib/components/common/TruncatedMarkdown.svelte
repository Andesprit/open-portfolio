<script lang="ts">
	import { marked } from 'marked';

	export let text: string;
	export let className: string = '';

	// Character limit - now required to be passed from parent
	export let limit: number;

	let isExpanded = false;

	// Strip HTML tags to get plain text content for length calculation
	function stripHtml(html: string): string {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;
		return tempDiv.textContent || tempDiv.innerText || '';
	}

	function shouldTruncate(plainText: string): boolean {
		return !!(plainText && plainText.length > limit);
	}

	function truncateHtml(html: string, charLimit: number): string {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;

		let charCount = 0;
		let truncated = false;

		function truncateNode(node: Node): Node | null {
			if (truncated) return null;

			if (node.nodeType === Node.TEXT_NODE) {
				const textContent = node.textContent || '';
				if (charCount + textContent.length > charLimit) {
					const remainingChars = charLimit - charCount;
					if (remainingChars > 0) {
						const truncatedText = textContent.substring(0, remainingChars) + '...';
						node.textContent = truncatedText;
						truncated = true;
						return node;
					}
					return null;
				} else {
					charCount += textContent.length;
					return node;
				}
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;
				const newElement = element.cloneNode(false);

				for (let child of Array.from(element.childNodes)) {
					const truncatedChild = truncateNode(child);
					if (truncatedChild) {
						newElement.appendChild(truncatedChild);
					}
					if (truncated) break;
				}

				return newElement;
			}

			return node.cloneNode(true);
		}

		const result = document.createElement('div');
		for (let child of Array.from(tempDiv.childNodes)) {
			const truncatedChild = truncateNode(child);
			if (truncatedChild) {
				result.appendChild(truncatedChild);
			}
			if (truncated) break;
		}

		return result.innerHTML;
	}

	function injectButtonIntoHtml(html: string, buttonText: string): string {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = html;

		// Find the last text node to append the button
		function findLastTextNode(node: Node): Text | null {
			if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
				return node as Text;
			}

			let lastTextNode: Text | null = null;
			for (let i = node.childNodes.length - 1; i >= 0; i--) {
				const child = node.childNodes[i];
				const found = findLastTextNode(child);
				if (found) {
					lastTextNode = found;
					break;
				}
			}
			return lastTextNode;
		}

		const lastTextNode = findLastTextNode(tempDiv);
		if (lastTextNode && lastTextNode.parentNode) {
			// Create the button element
			const button = document.createElement('button');
			button.className = 'show-more-btn';
			button.textContent = buttonText;
			button.setAttribute('data-action', isExpanded ? 'collapse' : 'expand');

			// Insert the button right after the last text node
			const parent = lastTextNode.parentNode;
			parent.insertBefore(document.createTextNode(' '), lastTextNode.nextSibling);
			parent.insertBefore(button, lastTextNode.nextSibling?.nextSibling || null);
		}

		return tempDiv.innerHTML;
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	// Handle button clicks from the injected HTML
	function handleClick(event: Event) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('show-more-btn')) {
			event.preventDefault();
			toggleExpanded();
		}
	}

	// Handle keyboard events for accessibility
	function handleKeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (
			target.classList.contains('show-more-btn') &&
			(event.key === 'Enter' || event.key === ' ')
		) {
			event.preventDefault();
			toggleExpanded();
		}
	}

	// Parse markdown first, then handle truncation
	$: {
		try {
			const fullHtmlContent = marked.parse(text || '');
			const fullHtml = typeof fullHtmlContent === 'string' ? fullHtmlContent : '';
			const plainText = stripHtml(fullHtml);

			if (isExpanded || !shouldTruncate(plainText)) {
				htmlContent = fullHtml;
				needsTruncation = shouldTruncate(plainText);
				if (needsTruncation) {
					htmlContent = injectButtonIntoHtml(htmlContent, 'Show less');
				}
			} else {
				htmlContent = truncateHtml(fullHtml, limit);
				htmlContent = injectButtonIntoHtml(htmlContent, 'Show more');
				needsTruncation = true;
			}
		} catch (error) {
			console.error('TruncatedMarkdown - markdown parsing error:', error);
			htmlContent = text || '';
			needsTruncation = false;
		}
	}

	let htmlContent = '';
	let needsTruncation = false;
</script>

{#if text && text.trim()}
	<div
		class="markdown-content {className}"
		on:click={handleClick}
		on:keydown={handleKeydown}
		role="presentation"
	>
		{@html htmlContent}
	</div>
{/if}

<style>
	.markdown-content {
		/* Use contents to not interfere with parent layout */
		display: contents;
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

	.markdown-content :global(p:last-child) {
		margin-right: 20px;
	}

	.markdown-content :global(p) {
		margin: 0 0 0.5em 0;
	}

	.markdown-content :global(p:last-child) {
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
