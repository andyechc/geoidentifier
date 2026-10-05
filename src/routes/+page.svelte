<script>
	import { _ } from "svelte-i18n";
	import { locale } from "$lib/stores/locale.js";
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import WorldGlobe from "$lib/components/WorldGlobe.svelte";
	import ContinentShape from "$lib/components/ContinentShape.svelte";
	import {
		visibleContinents,
		liveCountriesOf,
		liveGetCountry,
		dataRev,
		continentLabel
	} from "$lib/data/live.js";

	let notice = $state("");

	const PLACEHOLDERS = ["europe", "asia", "oceania"];

	// continentes con datos (base + añadidos en el admin) + huecos futuros
	const continents = $derived.by(() => {
		$dataRev;
		return [
			...visibleContinents().map((c) => ({
				slug: c.id,
				active: true,
				name: continentLabel(c.id, $locale),
				count: liveCountriesOf(c.id).length
			})),
			...PLACEHOLDERS.map((slug) => ({ slug, active: false, name: null, count: 0 }))
		];
	});

	function goCountry(slug) {
		const c = liveGetCountry(slug);
		goto(c ? `${base}/${c.continent}/${slug}` : `${base}/`);
	}
</script>

<svelte:head>
	<title>GeoIdentifier</title>
</svelte:head>

<section class="hero-scroll flex flex-col items-center py-16 text-center md:py-24">
	<h1 class="hero-item mx-auto max-w-3xl text-4xl font-black leading-tight md:text-6xl">
		{$_("home.title")}
	</h1>
	<p class="hero-item mx-auto mt-4 max-w-2xl text-base-content/60">{$_("home.subtitle")}</p>
	<div class="hero-item mt-8 flex flex-wrap justify-center gap-3">
		<a href="{base}/africa" class="btn btn-primary">{$_("home.start")}</a>
		<a href="{base}/drill" class="btn btn-neutral">{$_("home.drillCta")}</a>
	</div>
</section>

<div class="mx-auto max-w-[640px]">
	<WorldGlobe onSelect={goCountry} onMissing={(n) => (notice = n)} />
	{#if notice}
		<p class="mt-2 text-center text-sm text-base-content/50">{notice} — {$_("home.globeSoon")}</p>
	{/if}
</div>

<section class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each continents as c}
		{#if c.active}
			<a
				href="{base}/{c.slug}"
				class="card border border-primary/40 bg-base-200 p-6 transition hover:-translate-y-1 hover:border-primary"
			>
				<div class="flex items-center gap-4">
					<div class="w-24 shrink-0">
						<ContinentShape continent={c.slug} />
					</div>
					<div>
						<h2 class="text-2xl font-bold">{c.name}</h2>
						<p class="mt-1 text-sm text-base-content/60">
							{c.count} {$_("continent.countries")} · MVP
						</p>
					</div>
				</div>
			</a>
		{:else}
			<div class="card border border-base-300 bg-base-200/50 p-6 opacity-45">
				<div class="flex items-center gap-4">
					<div class="w-24 shrink-0">
						<ContinentShape continent={c.slug} />
					</div>
					<div>
						<h2 class="text-2xl font-bold capitalize">{c.slug.replace("-", " ")}</h2>
						<p class="mt-1 text-sm text-base-content/50">{$_("home.comingSoon")}</p>
					</div>
				</div>
			</div>
		{/if}
	{/each}
</section>

<style>
	/* Scroll-driven hero reveal (progressive enhancement) */
	@supports (animation-timeline: view()) {
		.hero-item {
			animation: hero-rise linear both;
			animation-timeline: view();
			animation-range: entry 0% cover 32%;
		}
		.hero-item:nth-child(2) {
			animation-range: entry 4% cover 40%;
		}
		.hero-item:nth-child(3) {
			animation-range: entry 8% cover 48%;
		}
	}

	@keyframes hero-rise {
		from {
			opacity: 0;
			transform: translateY(28px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-item {
			animation: none !important;
		}
	}
</style>