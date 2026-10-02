<script>
	import { _ } from "svelte-i18n";
	import { locale } from "$lib/stores/locale.js";
	import { isoToFlag } from "$lib/data/index.js";
	import CountryShape from "$lib/components/CountryShape.svelte";

	// countries to quiz on, i18n key for the heading, optional continent back-link
	let { countries = [], titleKey = "drill.title", backHref = null, backLabel = null } = $props();

	let pool = $state([]);
	let current = $state(null);
	let options = $state([]);
	let picked = $state(null);
	let score = $state(0);
	let rounds = $state(0);
	let streak = $state(0);
	let roundImage = $state(null);

	function shuffle(a) {
		const arr = [...a];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function next() {
		if (pool.length === 0) {
			pool = shuffle(countries.flatMap((c) => c.metas.map((m) => ({ c, m }))));
		}
		current = pool.pop();
		options = shuffle([
			current.c,
			...shuffle(countries.filter((c) => c.slug !== current.c.slug)).slice(0, 3)
		]);
		// The meta's own photo(s); fall back to any country photo if it has none.
		const own = current.m.images ?? [];
		roundImage = own.length
			? own[Math.floor(Math.random() * own.length)]
			: (current.c.images ?? []).length
				? current.c.images[Math.floor(Math.random() * current.c.images.length)]
				: null;
		picked = null;
	}

	function answer(c) {
		if (picked) return;
		picked = c.slug;
		rounds += 1;
		if (c.slug === current.c.slug) {
			score += 1;
			streak += 1;
		} else {
			streak = 0;
		}
	}

	function restart() {
		pool = [];
		current = null;
		options = [];
		picked = null;
		score = 0;
		rounds = 0;
		streak = 0;
		next();
	}

	function onKey(e) {
		if (!current) return;
		if (picked === null) {
			if (["1", "2", "3", "4"].includes(e.key)) {
				const c = options[Number(e.key) - 1];
				if (c) answer(c);
			}
			return;
		}
		const isSpace = e.key === " " || e.code === "Space";
		const isEnter = e.key === "Enter";
		if (!isSpace && !isEnter) return;
		// A focused button already handles Space natively — don't advance twice.
		if (isSpace && e.target instanceof Element && e.target.closest("button")) return;
		e.preventDefault();
		next();
	}

	const isRight = $derived(picked !== null && picked === current?.c.slug);
	const deckTotal = $derived(rounds + pool.length);

	// first round on mount (client)
	$effect(() => {
		if (!current && countries.length) next();
	});
</script>

<svelte:window onkeydown={onKey} />

<div class="mx-auto max-w-3xl">
	<nav class="mb-4 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
		<a href="/" class="btn btn-ghost btn-sm">
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<path d="M9 22V12h6v10" />
			</svg>
			{$_("nav.home")}
		</a>
		{#if backHref && backLabel}
			<span class="select-none text-base-content/30">/</span>
			<a href={backHref} class="btn btn-ghost btn-sm">
				{backLabel}
			</a>
		{/if}
	</nav>

	<!-- ── header ─────────────────────────────────────────── -->
	<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-black md:text-4xl">{$_(titleKey)}</h1>
			<p class="mt-1 text-xs text-base-content/50">{$_("drill.pickHint")}</p>
		</div>

		<div class="flex items-stretch gap-2">
			<div class="rounded-xl border border-base-300 bg-base-200 px-3.5 py-2 text-center">
				<div class="text-xl font-black leading-none text-primary">{score}</div>
				<div class="mt-1 text-[10px] uppercase tracking-wider text-base-content/50">
					{$_("drill.score")}
				</div>
			</div>
			<div class="rounded-xl border border-base-300 bg-base-200 px-3.5 py-2 text-center">
				<div class="text-xl font-black leading-none">{streak}</div>
				<div class="mt-1 text-[10px] uppercase tracking-wider text-base-content/50">
					{$_("drill.streak")}
				</div>
			</div>
			<div class="rounded-xl border border-base-300 bg-base-200 px-3.5 py-2 text-center">
				<div class="text-xl font-black leading-none">{pool.length}</div>
				<div class="mt-1 text-[10px] uppercase tracking-wider text-base-content/50">
					{$_("drill.remaining")}
				</div>
			</div>
		</div>
	</div>

	<!-- ── deck progress ──────────────────────────────────── -->
	{#if current}
		<div class="mb-5">
			<div class="h-1.5 w-full overflow-hidden rounded-full bg-base-300">
				<div
					class="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
					style:width="{deckTotal ? (rounds / deckTotal) * 100 : 0}%"
				></div>
			</div>
			<div class="mt-1.5 flex justify-between text-[11px] text-base-content/40">
				<span>{rounds} / {deckTotal}</span>
				<span>{Math.round(rounds ? (score / rounds) * 100 : 0)}%</span>
			</div>
		</div>

		<!-- ── the meta ────────────────────────────────────── -->
		<article class="card border border-base-300 bg-base-200 p-5">
			<p class="text-xs font-bold tracking-wider text-primary">
				{$_("drill.metaLabel").toUpperCase()}
			</p>
			<h2 class="mt-1 text-xl font-bold md:text-2xl">{current.m.title[$locale]}</h2>
			<p class="mt-2 leading-relaxed text-base-content/80">{current.m.body[$locale]}</p>
			{#if roundImage}
				<img
					src={roundImage}
					alt=""
					loading="lazy"
					class="mt-4 max-h-80 w-full rounded-xl border border-base-300 bg-base-100 object-contain"
				/>
			{/if}
		</article>

		<!-- ── answers ─────────────────────────────────────── -->
		<div class="mt-4 grid gap-2 sm:grid-cols-2">
			{#each options as c, i}
				{@const correct = c.slug === current.c.slug}
				{@const wrong = picked !== null && c.slug === picked && !correct}
				{@const faded = picked !== null && !correct && !wrong}
				<button
					class="group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200
						{picked === null
						? 'border-base-300 bg-base-200 hover:-translate-y-0.5 hover:border-primary/60'
						: correct
							? 'border-primary bg-primary/15'
							: wrong
								? 'border-error bg-error/15'
								: 'border-base-300 bg-base-200 opacity-40'}"
					disabled={picked !== null}
					onclick={() => answer(c)}
				>
					<span class="text-2xl leading-none">{isoToFlag(c.iso)}</span>
					<span class="flex-1 font-semibold">{c.name[$locale]}</span>
					{#if correct && picked !== null}
						<svg class="h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 6 9 17l-5-5" />
						</svg>
					{:else if wrong}
						<svg class="h-5 w-5 shrink-0 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					{:else}
						<span
							class="kbd kbd-sm shrink-0 border-base-300 bg-base-100 text-base-content/50 group-hover:border-primary/40"
							>{i + 1}</span
						>
					{/if}
				</button>
			{/each}
		</div>

		<!-- ── reveal ──────────────────────────────────────── -->
		{#if picked !== null}
			<div
				class="card mt-4 flex flex-wrap items-center gap-4 border p-4 {isRight
					? 'border-primary bg-primary/10'
					: 'border-error bg-error/10'}"
			>
				<div class="w-24 shrink-0 text-primary">
					<CountryShape slug={current.c.slug} />
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-bold tracking-wider {isRight ? 'text-primary' : 'text-error'}">
						{isRight ? $_("drill.correct") : $_("drill.wrong")}
					</p>
					<p class="mt-0.5 text-lg font-bold">{current.c.name[$locale]}</p>
				</div>
				<button class="btn btn-primary gap-2" onclick={next}>
					{$_("drill.next")}
					<kbd
						class="kbd kbd-sm border-primary-content/30 bg-primary-content/15 text-[10px] text-primary-content"
						>↵ / ␣</kbd
					>
				</button>
			</div>
		{/if}

		<div class="mt-6 flex justify-center">
			<button class="btn btn-ghost btn-sm text-base-content/50" onclick={restart}>
				{$_("drill.restart")}
			</button>
		</div>
	{/if}
</div>