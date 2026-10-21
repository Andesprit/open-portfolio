<script lang="ts">
	import { fadeIn } from '$lib/utils/fadeInUtils';
	import { followCardTarget } from '$lib/utils/cardTarget';
	import type { Skill } from '$lib/types/types';
	export let title: string = 'Skills';
	export let skillsData: Skill[] = [];

	import '/src/styles/cards-with-icons.css';
</script>

<section id={title.toLowerCase().replace(/\s+/g, '-')} class="skills section" use:fadeIn use:followCardTarget={{ ids: skillsData.map(skill => skill.searchId || '') }}>
	<h2 class="section-title">{title}</h2>
	<div class="skills-grid">
		{#each skillsData as skillCategory}
			<div class="skill-card" id={skillCategory.searchId} tabindex="-1" data-search-card>
				<div class="skill-header">
					{#if skillCategory.icon}
						<div class="skill-icon">
							<img src={skillCategory.icon} alt={`${skillCategory.name} logo`} />
						</div>
					{/if}
					<h3>{skillCategory.name}</h3>
				</div>
				<div class="skill-tags">
					{#each skillCategory.skills as subskill}
						<span class="tag">{subskill}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
