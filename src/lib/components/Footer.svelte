<script lang="ts">
	import type { PortfolioData } from '../types/types.js';
	import { base } from '$app/paths';
	import { getAbsoluteLink } from '$lib/utils/linkUtils';

	export let portfolioData: PortfolioData;

	let copied: boolean = false;

	function copyToClipboard(email: string): void {
		if (!email) {
			console.error('Clipboard API not available.');
			alert('Sorry, copying to clipboard is not supported in your browser.');
			return;
		}
		navigator.clipboard
			.writeText(email)
			.then(() => {
				copied = true;
				requestAnimationFrame(() => {
					setTimeout(() => {
						copied = false;
					}, 2000);
				});
			})
			.catch((err: Error) => {
				console.error('Failed to copy email: ', err);
				alert('Failed to copy email to clipboard.');
			});
	}

	// Helper function to ensure absolute paths for icons
	function getAbsoluteIconPath(iconPath: string): string {
		if (!iconPath) return '';
		// If already absolute (starts with / or http), return as is
		if (iconPath.startsWith('/') || iconPath.startsWith('http')) {
			return iconPath;
		}
		return `${base}/${iconPath}`;
	}
</script>

<footer class="footer">
	<div class="footer-content">
		<div class="footer-section">
			<h3>{portfolioData.settings.name}</h3>
		</div>

		<div class="footer-section">
			<div class="footer-social">
				{#each portfolioData.social as social}
					{#if social.name.toLowerCase() !== 'email'}
						<a
							class="footer-social-link"
							href={getAbsoluteLink(social.link, base)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img src={getAbsoluteIconPath(social.icon)} alt={`${social.name} Icon`} />
						</a>
					{/if}
				{/each}
			</div>
		</div>

		<div class="footer-section">
			{#each portfolioData.social as social}
				{#if social.name.toLowerCase() === 'email'}
					<div class="footer-email">
						<a href={`mailto:${social.link}`} class="email-link">
							{#if social.icon}<img
									src={getAbsoluteIconPath(social.icon)}
									alt="Email"
									class="email-icon"
								/>{/if}
							<span>{social.link}</span>
						</a>
						<button
							class="footer-copy-button"
							on:click={() => social.link && copyToClipboard(social.link)}
							title="Copy email address"
						>
							<img
								src={getAbsoluteIconPath(copied ? 'icons/check-icon.svg' : 'icons/copy-icon.svg')}
								alt={copied ? 'Copied' : 'Copy'}
							/>
						</button>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<div class="footer-bottom">
		<p>
			&copy; 2025 <a href="https://github.com/open-portfolio/open-portfolio" target="_blank">Open Portfolio</a> Licensed under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT License</a>
		</p>
	</div>
</footer>

<style>
	.footer {
		background: var(--card-background);
		border-top: var(--card-border);
		margin-top: 60px;
		font-family: var(--font-system);
		transition: background-color 0.3s ease;
	}

	.footer-content {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 40px;
		max-width: 1200px;
		margin: 0 auto;
		padding: 10px 20px 0;
		align-items: center;
	}

	.footer-section h3 {
		color: var(--text-color);
		font-size: 1.3rem;
		margin: 0;
		font-weight: 600;
		transition: color 0.3s ease;
	}

	.footer-section:nth-child(3) {
		display: flex;
		justify-content: flex-end;
	}

	.footer-email {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--contact-item-background, rgba(0, 0, 0, 0.02));
		border-radius: 10px;
		transition: all 0.2s ease;
	}

	.footer-email:hover {
		background: var(--contact-item-background-hover, rgba(0, 0, 0, 0.05));
		transform: translateY(-2px);
	}

	.email-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--text-color);
		font-size: 1rem;
		flex: 1;
		transition: color 0.2s ease;
	}

	.email-link:hover {
		color: var(--link-hover-color, var(--secondary-color));
	}

	.email-icon {
		width: 20px;
		height: 20px;
		filter: var(--icon-filter);
		transition:
			transform 0.2s ease,
			filter 0.3s ease;
	}

	.footer-copy-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.footer-copy-button:hover {
		background: var(--hover-background-subtle, rgba(0, 119, 204, 0.1));
	}

	.footer-copy-button img {
		width: 18px;
		height: 18px;
		transition:
			opacity 0.2s ease,
			filter 0.3s ease;
		display: block;
		filter: var(--icon-filter);
	}

	.footer-copy-button:hover img {
		opacity: 1;
	}

	.footer-social {
		display: flex;
		justify-content: center;
		gap: 20px;
	}

	.footer-social-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
		background: var(--contact-item-background, rgba(0, 0, 0, 0.02));
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.footer-social-link:hover {
		background: var(--contact-item-background-hover, rgba(0, 0, 0, 0.05));
		transform: translateY(-3px);
	}

	.footer-social-link img {
		width: 24px;
		height: 24px;
		filter: var(--icon-filter);
		transition:
			transform 0.2s ease,
			filter 0.3s ease;
	}

	.footer-social-link:hover img {
		transform: scale(1.1);
	}

	.footer-bottom {
		border-top: 1px solid var(--card-border, rgba(0, 0, 0, 0.1));
		padding: 10px;
		text-align: center;
	}

	.footer-bottom p {
		color: var(--text-secondary-color);
		font-size: 0.7rem;
		margin: 0;
		transition: color 0.3s ease;
	}

	.footer-bottom a {
		color: var(--primary-color);
		text-decoration: none;
	}

	@media (max-width: 900px) {
		.footer-content {
			grid-template-columns: 1fr;
			gap: 10px;
			padding: 20px 10px 0;
			text-align: center;
		}

		.footer-section:nth-child(3) {
			justify-content: center;
		}

		.footer-social {
			gap: 15px;
		}

		.footer-social-link {
			width: 40px;
			height: 40px;
		}

		.footer-social-link img {
			width: 22px;
			height: 22px;
		}

		.footer-section h3 {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 600px) {
		.footer-email {
			padding: 10px 12px;
			gap: 10px;
		}

		.email-link {
			font-size: 0.95rem;
		}

		.email-icon {
			width: 18px;
			height: 18px;
		}

		.footer-copy-button img {
			width: 16px;
			height: 16px;
		}

		.footer-social {
			gap: 12px;
		}

		.footer-social-link {
			width: 36px;
			height: 36px;
		}

		.footer-social-link img {
			width: 20px;
			height: 20px;
		}
	}
</style>
