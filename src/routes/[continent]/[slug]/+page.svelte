<script>
	import { _ } from "svelte-i18n";
	import { locale } from "$lib/stores/locale.js";
	import {
		liveGetCountry as getCountry,
		isoToFlag,
		visibleContinents,
		dataRev,
		continentLabel
	} from "$lib/data/live.js";
	import DriveBadge from "$lib/components/DriveBadge.svelte";
	import FactIcon from "$lib/components/FactIcon.svelte";
	import LanguageBadge from "$lib/components/LanguageBadge.svelte";
	import { base } from "$app/paths";
	import CountryShape from "$lib/components/CountryShape.svelte";
	import ContinentShape from "$lib/components/ContinentShape.svelte";
	import { page } from "$app/stores";

	const c = $derived.by(() => {
		$dataRev;
		return getCountry($page.params.slug);
	});
	const clabel = $derived(c ? continentLabel(c.continent, $locale) : "");
	let showLocator = $state(false);
	let lightbox = $state(null);

	// lightbox = "<metaIndex>-<imageIndex>"
	let shot = $derived.by(() => {
		if (!c || lightbox === null) return null;
		const [i, k] = lightbox.split("-").map(Number);
		const list = c.metas[i]?.images ?? [];
		return list[k] ? { src: list[k], at: [i, k] } : null;
	});
</script>

<svelte:head>
	<title>{c ? `${c.name[$locale]} · GeoIdentifier` : 'GeoIdentifier'}</title>
</svelte:head>

{#if c}
	<nav class="mb-4 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
		<a href="{base}/" class="btn btn-ghost btn-sm">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<path d="M9 22V12h6v10" />
			</svg>
			{$_("nav.home")}
		</a>
		<span class="select-none text-base-content/30">/</span>
		<a href="{base}/{c.continent}" class="btn btn-ghost btn-sm">
			{clabel}
		</a>
		<span class="select-none text-base-content/30">/</span>
		<span class="px-1 text-sm font-semibold text-base-content/80">{c.name[$locale]}</span>
	</nav>

	<div class="mb-8 grid items-start gap-6 md:grid-cols-[1fr_280px]">
		<div>
			<div class="flex items-center gap-4">
				<span class="text-6xl">{isoToFlag(c.iso)}</span>
				<div>
					<h1 class="text-4xl font-black">{c.name[$locale]}</h1>
					<p class="text-sm text-base-content/50">
						{$_("country.source")}: <a
							class="link link-primary"
							href={c.source}
							target="_blank"
							rel="noreferrer">plonkit.net</a
						>
					</p>
				</div>
			</div>

			<h2 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wider text-base-content/50">
				{$_("country.facts")}
			</h2>
			<div class="flex flex-wrap gap-2">
				{#if c.facts.drive}<DriveBadge
						side={c.facts.drive.en === "Left" ? "Left" : "Right"}
						label={c.facts.drive[$locale]}
					/>{/if}
				{#if c.facts.language}<LanguageBadge
						language={c.facts.language[$locale]}
						label={c.facts.language[$locale]}
						sample={c.languageMeta?.sample ?? ""}
						tip={c.languageMeta?.tip?.[$locale] ?? ""}
					/>{/if}
{#if c.facts.domain}<span class="badge badge-lg gap-2 badge-primary"
					><FactIcon name="globe" />{c.facts.domain}</span
				>{/if}
				{#if c.facts.prefix}<span class="badge badge-lg gap-2 badge-primary"
					><FactIcon name="phone" />{c.facts.prefix}</span
				>{/if}
			</div>
		</div>
		<div class="relative flex flex-col items-center" tabindex="0"
			onmouseenter={() => (showLocator = true)}
			onmouseleave={() => (showLocator = false)}
			onfocus={() => (showLocator = true)}
			onblur={() => (showLocator = false)}
		>
			<CountryShape slug={c.slug} class="w-[320px] max-w-full" />
			<p class="mt-1 text-center text-xs text-base-content/50">{$_("country.locateTitle")}</p>
			{#if showLocator}
				<div class="absolute top-full left-1/2 z-30 mt-3 w-[360px] max-w-[80vw] -translate-x-1/2">
					<div class="card border border-base-300 bg-base-200 p-3 shadow-2xl">
						<p class="mb-1 px-1 text-sm font-bold">
							{c.name[$locale]} — {$_("country.locateTitle")}
						</p>
						<div>
							<ContinentShape continent={c.continent} highlight={c.slug} />
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-base-content/50">
		{$_("country.metas")} ({c.metas.length})
	</h2>
	<div class="grid gap-4 lg:grid-cols-2">
		{#each c.metas as m, i}
			<article class="card border border-base-300 bg-base-200 p-5">
				<p class="text-xs font-bold text-primary">META {i + 1}</p>
				<h3 class="mt-1 text-xl font-bold">{m.title[$locale]}</h3>
				<p class="mt-2 leading-relaxed text-base-content/80">{m.body[$locale]}</p>
				{#if m.images?.length}
					<div class="mt-3 flex flex-wrap gap-2">
						{#each m.images as src, k}
							<button
								class="group overflow-hidden rounded-xl border border-base-300 bg-base-100 transition-all duration-200 hover:border-primary/60"
								onclick={() => (lightbox = `${i}-${k}`)}
								aria-label={$_("country.galleryOpen")}
							>
								<img
									{src}
									alt="{m.title[$locale]}"
									loading="lazy"
									class="h-44 w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</article>
		{/each}
	</div>

{:else}
	<p class="text-xl">404 — ¿país? / country?</p>
	<div class="mt-4 flex gap-2">
		<a href="{base}/" class="btn btn-ghost">{$_("nav.home")}</a>
		<a href="{base}/{$page.params.continent}" class="btn btn-primary">
			{clabel}
		</a>
	</div>
{/if}

{#if shot}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={() => (lightbox = null)}
		onkeydown={(e) => e.key === "Escape" && (lightbox = null)}
		role="presentation"
	>
		<figure class="card max-h-full w-full max-w-4xl border border-base-300 bg-base-200 p-3">
			<img src={shot.src} alt={c.name[$locale]} class="max-h-[75vh] w-full rounded-lg object-contain" />
			<figcaption class="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-base-content/50">
				<span class="min-w-0 truncate font-semibold text-base-content/80">
					{c.metas[shot.at[0]]?.title[$locale]}
				</span>
				<span class="flex shrink-0 items-center gap-2">
					<button
						class="btn btn-ghost btn-xs"
						disabled={shot.at[1] === 0}
						onclick={(e) => { e.stopPropagation(); lightbox = `${shot.at[0]}-${shot.at[1] - 1}`; }}
						aria-label={$_("country.galleryPrev")}
					>
						←
					</button>
					<span class="tabular-nums">
						{shot.at[1] + 1} / {c.metas[shot.at[0]]?.images.length}
					</span>
					<button
						class="btn btn-ghost btn-xs"
						disabled={shot.at[1] === (c.metas[shot.at[0]]?.images.length ?? 1) - 1}
						onclick={(e) => { e.stopPropagation(); lightbox = `${shot.at[0]}-${shot.at[1] + 1}`; }}
						aria-label={$_("country.galleryNext")}
					>
						→
					</button>
				</span>
			</figcaption>
		</figure>
	</div>
{/if}
