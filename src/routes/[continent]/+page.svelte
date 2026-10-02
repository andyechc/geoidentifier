<script>
	import { _ } from "svelte-i18n";
	import { page } from "$app/stores";
	import { locale } from "$lib/stores/locale.js";
	import {
		liveCountriesOf as countriesOf,
		isoToFlag,
		visibleContinents,
		dataRev,
		continentLabel
	} from "$lib/data/live.js";
	import { base } from "$app/paths";
	import DriveBadge from "$lib/components/DriveBadge.svelte";
	import ContinentShape from "$lib/components/ContinentShape.svelte";

	const cs = $derived.by(() => {
		$dataRev;
		return countriesOf($page.params.continent);
	});
	const meta = $derived.by(() => {
		$dataRev;
		return visibleContinents().find((c) => c.id === $page.params.continent);
	});
	const title = $derived(meta ? continentLabel(meta.id, $locale) : null);
</script>

{#if !meta}
	<p class="text-xl">404 — ¿continente? / continent?</p>
	<a href="{base}/" class="btn btn-primary mt-4">{$_("nav.home")}</a>
{:else}
	<nav class="mb-4 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
		<a href="{base}/" class="btn btn-ghost btn-sm">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<path d="M9 22V12h6v10" />
			</svg>
			{$_("nav.home")}
		</a>
		<span class="select-none text-base-content/30">/</span>
		<span class="px-1 text-sm font-semibold text-base-content/80">{title}</span>
	</nav>
	<div class="mb-10 flex flex-wrap items-center gap-8">
		<div class="w-40 shrink-0">
			<ContinentShape continent={$page.params.continent} />
		</div>
		<div class="flex-1">
			<h1 class="text-4xl font-black md:text-5xl">{title}</h1>
			<p class="mt-2 text-base-content/60">
				{$_("continent.pick")} · {cs.length} {$_("continent.countries")}
			</p>
		</div>
		<a href="{base}/{$page.params.continent}/drill" class="btn btn-primary">{$_("continent.drill")}</a>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each cs as c}
			<a
				href="{base}/{$page.params.continent}/{c.slug}"
				class="card border border-base-300 bg-base-200 p-5 transition hover:-translate-y-1 hover:border-primary/50"
			>
				<div class="flex items-center gap-3">
					<span class="text-4xl">{isoToFlag(c.iso)}</span>
					<div>
						<h2 class="text-xl font-bold">{c.name[$locale]}</h2>
						<p class="flex items-center gap-1.5 text-xs text-base-content/50">
							{c.metas.length} metas · {c.facts.domain} · {c.facts.prefix} ·
							{#if c.facts.drive}<DriveBadge
									compact
									side={c.facts.drive.en === "Left" ? "Left" : "Right"}
									label={c.facts.drive[$locale]}
								/>{/if}
						</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/if}