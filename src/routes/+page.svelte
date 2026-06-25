<script lang="ts">
    import type { PageData } from './$types';
    import About from '$lib/components/About.svelte';
    import DisplaySections from '$lib/components/DisplaySections.svelte';
    import Contact from '$lib/components/Contact.svelte';

    export let data: PageData;
    const { portfolioData, content } = data;
</script>

<div class="page-container">
    <About {portfolioData} />
    <DisplaySections {portfolioData} {content} />
</div>
