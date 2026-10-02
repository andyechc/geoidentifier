<script>
	// Traffic-sign style indicator: an up arrow and a down arrow stacked
	// vertically, placed on the side where traffic keeps.
	// side: "Left" | "Right" (side of the road traffic keeps to).
	let { side = "Right", label = "", compact = false } = $props();

	const left = $derived(side === "Left");
	// x centres for the two arrows (up on top, down below)
	const xUp = $derived(left ? 7 : 13);
	const xDown = $derived(left ? 13 : 7);
</script>

{#snippet arrows()}
	<svg
		viewBox="0 0 20 24"
		class="h-4 w-4 shrink-0"
		fill="none"
		stroke="currentColor"
		stroke-width="2.4"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<!-- arrow up (same direction as you) -->
		<path d="M{xUp} 19V8" />
		<path d="M{xUp - 3.6} 11.6  {xUp} 8  {xUp + 3.6} 11.6" />
		<!-- arrow down (opposite direction) -->
		<path d="M{xDown} 5v11" />
		<path d="M{xDown - 3.6} 12.4  {xDown} 16  {xDown + 3.6} 12.4" />
	</svg>
{/snippet}

{#if compact}
	<span
		class="inline-flex items-center gap-1 text-base-content/60"
		title={label || (left ? "Left-hand traffic" : "Right-hand traffic")}
	>
		{@render arrows()}
	</span>
{:else}
	<span class="badge badge-lg gap-2 badge-primary">
		{@render arrows()}
		{label}
	</span>
{/if}