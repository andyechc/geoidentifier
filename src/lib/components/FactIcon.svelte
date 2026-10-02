<script>
	// Inline Lucide icons (ISC license, https://lucide.dev).
	// The lucide Svelte packages break Vite dev SSR in this setup,
	// so the three icons we need live here with zero dependencies.
	let { name = "globe", size = 18 } = $props();

	const paths = {
		languages: [
			["path", "m5 8 6 6"],
			["path", "m4 14 6-6 2-3"],
			["path", "M2 5h12"],
			["path", "M7 2h1"],
			["path", "m22 22-5-10-5 10"],
			["path", "M14 18h6"]
		],
		globe: [
			["circle", null, { cx: 12, cy: 12, r: 10 }],
			["path", "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"],
			["path", "M2 12h20"]
		],
		phone: [
			[
				"path",
				"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
			]
		]
	};

	let nodes = $derived(paths[name] ?? paths.globe);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#each nodes as [tag, d, attrs]}
		{#if tag === "circle"}
			<circle cx={attrs.cx} cy={attrs.cy} r={attrs.r} />
		{:else}
			<path {d} />
		{/if}
	{/each}
</svg>
