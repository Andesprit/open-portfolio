<script lang="ts">
	export let warnings: string[] = [];
</script>

{#if warnings.length}
	<aside class="development-config-notice" aria-label="Portfolio content warnings" aria-live="polite">
		<details open>
			<summary><strong>Portfolio content: {warnings.length} {warnings.length === 1 ? 'warning' : 'warnings'}</strong></summary>
			<p>Development only. Each warning starts with the file to edit: <code>portfolio-data.json</code> or a Markdown post's frontmatter between the <code>---</code> lines. Save the file and these checks update.</p>
			<ul>
				{#each warnings as warning}
					<li>{warning}</li>
				{/each}
			</ul>
		</details>
	</aside>
{/if}

<style>
	.development-config-notice {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 1100;
		box-sizing: border-box;
		width: min(42rem, calc(100% - 2rem));
		max-height: 45vh;
		overflow: auto;
		padding: 1rem;
		border: 2px solid var(--primary-color, #333);
		border-radius: 0.5rem;
		background: var(--card-background, white);
		color: var(--text-color, #333);
		font-family: var(--font-system, sans-serif);
		font-size: 0.875rem;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	summary { cursor: pointer; }
	summary:focus-visible { outline: 2px solid var(--primary-color, #333); outline-offset: 0.25rem; }
	p { margin: 0.75rem 0; }
	ul { margin: 0; padding-left: 1.25rem; }
	li + li { margin-top: 0.75rem; }
</style>
