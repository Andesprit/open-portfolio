<script lang="ts">
	import { theme, getThemeToggle } from '$lib/stores/themeStore';

	function toggleTheme() {
		const newTheme = getThemeToggle($theme);
		theme.set(newTheme);
	}

	// Helper function to determine if current theme is dark
	$: isDark = $theme === 'dark' || $theme.endsWith('-dark');
</script>

<div class="theme-switcher">
	<button
		on:click={toggleTheme}
		title="Switch to {isDark ? 'light' : 'dark'} mode"
		aria-label="Toggle between light and dark theme"
	>
		<span class="toggle-icon" class:dark={isDark}>
			{isDark ? '☀️' : '🌙'}
		</span>
	</button>
</div>

<style>
	.theme-switcher {
		display: flex;
		align-items: center;
		position: relative;
		z-index: 1001;
	}

	.theme-switcher button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-secondary-color);
		font-size: 1.1rem;
		font-weight: 500;
		padding: 8px 12px;
		border-radius: 8px;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		position: relative;
		z-index: inherit;
	}

	.theme-switcher button::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		transition: width 0.3s ease;
	}

	.theme-switcher button:hover {
		color: var(--link-hover-color, var(--primary-color));
	}

	.theme-switcher button:hover::after {
		width: 100%;
	}

	.theme-switcher button:focus-visible {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	.toggle-icon {
		font-size: 1.1em;
		transition: transform 0.2s ease;
	}

	.toggle-icon.dark {
		transform: rotate(180deg);
	}

	@media (max-width: 1400px) {
		.theme-switcher button {
			display: block;
			padding: 12px;
			font-size: 1.1rem;
			border-radius: 8px;
			width: 100%;
			text-align: center;
		}

		.theme-switcher button:hover {
			background: var(--hover-background-subtle, rgba(34, 139, 230, 0.1));
			color: var(--link-hover-color, var(--primary-color));
		}

		.theme-switcher button::after {
			display: none;
		}
	}
</style>
