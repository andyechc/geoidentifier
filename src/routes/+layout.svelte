<script>
	import "../app.css";
	import "$lib/i18n";
	import { locale, locales } from "$lib/stores/locale.js";
	import { _ } from "svelte-i18n";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import LanguageToggle from "$lib/components/LanguageToggle.svelte";
	import Cursor from "$lib/components/Cursor.svelte";
	import { page } from "$app/stores";
	import { visibleContinents, dataRev, continentLabel, seedServerState } from "$lib/data/live.js";

	let { children, data } = $props();

	// overrides del servidor (-> SSR en cada petición y en cada navegación)
	if (data?.overrides) seedServerState(data.overrides);

	const CONTINENTS = $derived.by(() => {
		$dataRev;
		return visibleContinents();
	});
	const clabel = (id) => continentLabel(id, $locale);

	let path = $derived($page.url.pathname);
	// on a drill page the drill link owns the highlight, not the continent link
	let onDrill = $derived(path === "/drill" || path.endsWith("/drill"));
	let active = $derived(
		onDrill ? null : CONTINENTS.find((c) => path.startsWith(`/${c.id}`))
	);
</script>

<div class="min-h-screen bg-base-100 text-base-content">
	<header class="bg-base-950/80">
		<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
			<a href="/" class="text-lg font-black tracking-tight">
				Geo<span class="text-primary">Identifier</span>
			</a>
			<div class="flex items-center gap-4">
				{#each CONTINENTS as c}
					<a
						href="/{c.id}"
						class="rounded px-1 text-sm font-semibold transition-colors duration-200 {active?.id ===
						c.id
							? 'text-primary'
							: 'text-base-content/60 hover:text-base-content'}"
						aria-current={active?.id === c.id ? "page" : undefined}
					>
						{clabel(c.id)}
					</a>
				{/each}
				<a
					href="/drill"
					class="rounded px-1 text-sm font-semibold transition-colors duration-200 {onDrill
						? 'text-primary'
						: 'text-base-content/60 hover:text-base-content'}"
					aria-current={onDrill ? "page" : undefined}
				>
					{$_("nav.drill")}
				</a>
				<LanguageToggle />
				<ThemeToggle />
			</div>
		</nav>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children?.()}
		<Cursor />
	</main>
	<footer class="border-t border-base-300">
		<p class="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-base-content/50">
			{$_("footer.data")}
			<a class="link link-primary" href="https://www.plonkit.net/guide" target="_blank" rel="noreferrer"
				>Plonk It</a
			>
			· {$_("footer.imagery")}
		</p>
	</footer>
</div>