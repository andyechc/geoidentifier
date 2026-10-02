<script>
	import { onMount } from "svelte";
	import {
		visibleCountries,
		visibleContinents,
		continentIds,
		validateCountry,
		validateContinent,
		refreshServerState,
		apiMe,
		apiLogin,
		apiLogout,
		apiSaveCountry,
		apiDeleteCountry,
		apiSaveContinent,
		apiDeleteContinent,
		apiUpload,
		apiImport,
		apiReset,
		downloadJson,
		LEGACY_STORE_KEY
	} from "$lib/data/live.js";
	import CountryForm from "$lib/components/admin/CountryForm.svelte";

	let user = $state("");
	let pass = $state("");
	let loginError = $state("");
	let authed = $state(false);

	let tab = $state("paises");
	let countries = $state([]);
	let continents = $state([]);

	// edición: null | "__new" | slug
	let editing = $state(null);
	let formErrors = $state([]);

	let ncId = $state("");
	let ncEn = $state("");
	let ncEs = $state("");
	let ncErrors = $state([]);

	let importMsg = $state("");
	let statusMsg = $state("");
	let statusTimer = null;
	let legacyCount = $state(0);

	function flash(msg) {
		statusMsg = msg;
		clearTimeout(statusTimer);
		statusTimer = setTimeout(() => (statusMsg = ""), 5000);
	}

	function refresh() {
		countries = visibleCountries();
		continents = visibleContinents();
	}

	function readLegacy() {
		try {
			const raw = localStorage.getItem(LEGACY_STORE_KEY);
			if (!raw) return null;
			const o = JSON.parse(raw);
			if (!o || typeof o !== "object") return null;
			return o;
		} catch {
			return null;
		}
	}

	onMount(async () => {
		authed = await apiMe();
		await refreshServerState();
		refresh();
		const leg = readLegacy();
		legacyCount =
			leg == null
				? 0
				: Object.keys(leg.countries ?? {}).length +
					(leg.deleted ?? []).length +
					(leg.continents ?? []).length;
	});

	async function login() {
		if (await apiLogin(user.trim(), pass)) {
			authed = true;
			loginError = "";
			await refreshServerState();
			refresh();
		} else {
			loginError = "Usuario o contraseña incorrectos.";
		}
	}

	async function logout() {
		await apiLogout();
		authed = false;
		editing = null;
	}

	function blankCountry(continent) {
		return {
			slug: "",
			iso: "",
			continent: continent ?? continents[0]?.id ?? "africa",
			topo: "",
			name: { en: "", es: "" },
			source: "",
			facts: {
				drive: { en: "Right", es: "Derecha" },
				language: { en: "", es: "" },
				domain: "",
				prefix: ""
			},
			images: [],
			metas: []
		};
	}

	async function saveCountry(c, staged = []) {
		const taken = new Set(countries.map((x) => x.slug));
		if (editing !== "__new") taken.delete(editing);
		const errs = validateCountry(c, { isNew: editing === "__new", takenSlugs: taken });
		if (errs.length) {
			formErrors = errs;
			return;
		}
		try {
			// 1) subir fotos pendientes al servidor
			for (const s of staged) {
				const paths = await apiUpload(c.slug, s.file);
				for (const p of paths) {
					if (s.meta === null) c.images.push(p);
					else c.metas[s.meta]?.images.push(p);
				}
			}
			// 2) guardar país (persistente en disco del servidor)
			await apiSaveCountry(c, editing === "__new");
		} catch (e) {
			formErrors = [String(e?.message ?? e)];
			return;
		}
		refresh();
		editing = null;
		formErrors = [];
		flash(`“${c.slug}” guardado y publicado.`);
	}

	async function deleteCountry(slug) {
		const c = countries.find((x) => x.slug === slug);
		if (!c) return;
		if (!confirm(`¿Borrar "${slug}" del sitio?`)) return;
		try {
			await apiDeleteCountry(slug);
		} catch (e) {
			flash(`No se pudo borrar: ${e?.message ?? e}`);
			return;
		}
		refresh();
		flash(`“${slug}” borrado.`);
	}

	async function addContinent() {
		const c = {
			id: ncId.trim().toLowerCase(),
			label: { en: ncEn.trim(), es: ncEs.trim() }
		};
		const errs = validateContinent(c, { takenIds: new Set(continentIds()) });
		if (errs.length) {
			ncErrors = errs;
			return;
		}
		try {
			await apiSaveContinent(c);
		} catch (e) {
			ncErrors = [String(e?.message ?? e)];
			return;
		}
		ncId = ncEn = ncEs = "";
		ncErrors = [];
		refresh();
		flash(`Continente “${c.id}” creado.`);
	}

	async function deleteContinent(id) {
		const n = countries.filter((c) => c.continent === id).length;
		if (n > 0) {
			alert("Ese continente tiene países; bórralos o muévelos primero.");
			return;
		}
		if (!confirm(`¿Borrar el continente "${id}"?`)) return;
		try {
			await apiDeleteContinent(id);
		} catch (e) {
			flash(`No se pudo borrar: ${e?.message ?? e}`);
			return;
		}
		refresh();
		flash(`Continente “${id}” borrado.`);
	}

	async function onImportFile(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		try {
			const r = await apiImport(JSON.parse(await f.text()));
			refresh();
			importMsg = `Respaldo cargado (${r.countries} países, ${r.continents} continentes).`;
		} catch (err) {
			importMsg = `Archivo inválido: ${err?.message ?? err}`;
		}
		e.target.value = "";
	}

	async function migrateLegacy() {
		const leg = readLegacy();
		if (!leg) return;
		try {
			await apiImport(leg);
			localStorage.removeItem(LEGACY_STORE_KEY);
			legacyCount = 0;
			refresh();
			flash("Cambios locales migrados al servidor.");
		} catch (e) {
			flash(`No se pudo migrar: ${e?.message ?? e}`);
		}
	}

	async function doReset() {
		if (!confirm("¿Descartar TODOS los cambios del admin en el servidor?")) return;
		try {
			await apiReset();
		} catch (e) {
			flash(`No se pudo resetear: ${e?.message ?? e}`);
			return;
		}
		refresh();
		editing = null;
		flash("Todo descartado: el sitio vuelve a los datos base.");
	}

	const byContinent = $derived(
		continents.map((ct) => ({
			...ct,
			items: countries.filter((c) => c.continent === ct.id)
		}))
	);
</script>

<div class="mx-auto max-w-5xl">
	{#if !authed}
		<div class="mx-auto mt-10 max-w-sm">
			<div class="card border border-base-300 bg-base-200 p-6">
				<h1 class="text-2xl font-black">Admin</h1>
				<p class="mt-1 text-sm text-base-content/60">Acceso restringido a editores del sitio.</p>
				<label class="form-control mt-4">
					<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Usuario</span>
					<input
						class="input input-bordered"
						bind:value={user}
						autocomplete="username"
						onkeydown={(e) => e.key === "Enter" && login()}
					/>
				</label>
				<label class="form-control mt-3">
					<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Contraseña</span>
					<input
						type="password"
						class="input input-bordered"
						bind:value={pass}
						autocomplete="current-password"
						onkeydown={(e) => e.key === "Enter" && login()}
					/>
				</label>
				{#if loginError}
					<p class="mt-3 text-sm text-error">{loginError}</p>
				{/if}
				<button class="btn btn-primary mt-4 w-full" onclick={login}>Entrar</button>
				<a href="/" class="btn btn-ghost btn-sm mt-2 w-full">← Volver al sitio</a>
			</div>
		</div>
	{:else}
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 class="text-3xl font-black">Panel admin</h1>
				<p class="mt-1 text-sm text-base-content/60">
					{countries.length} países visibles · los cambios se publican al guardar
				</p>
			</div>
			<div class="flex gap-2">
				<a href="/" class="btn btn-ghost btn-sm">Ver sitio</a>
				<button class="btn btn-ghost btn-sm" onclick={logout}>Salir</button>
			</div>
		</div>

		{#if statusMsg}
			<div class="alert alert-success mb-4 py-2 text-sm">{statusMsg}</div>
		{/if}

		{#if legacyCount > 0}
			<div class="alert mb-4 text-sm">
				<span>Tienes cambios antiguos solo en este navegador ({legacyCount}).</span>
				<button class="btn btn-sm" onclick={migrateLegacy}>Migrar al servidor</button>
			</div>
		{/if}

		<div class="tabs tabs-boxed mb-6 w-fit">
			<button class="tab {tab === 'paises' ? 'tab-active' : ''}" onclick={() => (tab = "paises")}>
				Países
			</button>
			<button
				class="tab {tab === 'continentes' ? 'tab-active' : ''}"
				onclick={() => (tab = "continentes")}
			>
				Continentes
			</button>
			<button class="tab {tab === 'exportar' ? 'tab-active' : ''}" onclick={() => (tab = "exportar")}>
				Datos
			</button>
		</div>

		{#if tab === "paises"}
			{#if editing}
				<button class="btn btn-ghost btn-sm mb-4" onclick={() => ((editing = null), (formErrors = []))}>
					← Volver al listado
				</button>
				{#if editing === "__new"}
					{#key editing}
						<CountryForm
							initial={blankCountry(continents[0]?.id)}
							continentIds={continents.map((c) => c.id)}
							isNew={true}
							errors={formErrors}
							fsReady={true}
							onSave={saveCountry}
							onCancel={() => ((editing = null), (formErrors = []))}
						/>
					{/key}
				{:else}
					{#key editing}
						{@const ec = countries.find((c) => c.slug === editing)}
						{#if ec}
							<CountryForm
								initial={ec}
								continentIds={continents.map((c) => c.id)}
								isNew={false}
								errors={formErrors}
								fsReady={true}
								onSave={saveCountry}
								onCancel={() => ((editing = null), (formErrors = []))}
							/>
						{:else}
							<p class="text-error">Ese país ya no existe.</p>
						{/if}
					{/key}
				{/if}
			{:else}
				<button class="btn btn-primary btn-sm mb-4" onclick={() => ((editing = "__new"), (formErrors = []))}>
					+ Añadir país
				</button>
				{#each byContinent as ct}
					<h2 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wider text-base-content/50">
						{ct.label?.es ?? ct.label?.en ?? ct.id} ({ct.items.length})
					</h2>
					<div class="grid gap-2">
						{#each ct.items as c}
							<div
								class="flex flex-wrap items-center gap-3 rounded-xl border border-base-300 bg-base-200 px-4 py-2.5"
							>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-bold">
										{c.name?.en} <span class="font-normal opacity-50">/ {c.name?.es}</span>
									</p>
									<p class="font-mono text-xs opacity-50">
										{c.slug} · {c.metas?.length ?? 0} metas
									</p>
								</div>
								<button class="btn btn-ghost btn-xs" onclick={() => ((editing = c.slug), (formErrors = []))}>
									Editar
								</button>
								<button
									class="btn btn-ghost btn-xs"
									onclick={() => downloadJson(`${c.slug}.json`, c)}
								>
									JSON
								</button>
								<button class="btn btn-ghost btn-xs text-error" onclick={() => deleteCountry(c.slug)}>
									Borrar
								</button>
							</div>
						{/each}
						{#if !ct.items.length}
							<p class="text-sm opacity-40">Sin países todavía.</p>
						{/if}
					</div>
				{/each}
			{/if}
		{:else if tab === "continentes"}
			<div class="grid gap-2">
				{#each continents as ct}
					{@const n = countries.filter((c) => c.continent === ct.id).length}
					<div class="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200 px-4 py-2.5">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-bold">
								{ct.label?.es ?? ct.label?.en ?? ct.id}
								<span class="font-mono font-normal opacity-50">/{ct.id}</span>
							</p>
							<p class="text-xs opacity-50">{n} países</p>
						</div>
						<button class="btn btn-ghost btn-xs text-error" onclick={() => deleteContinent(ct.id)}>
							Borrar
						</button>
					</div>
				{/each}
			</div>

			<div class="card mt-6 border border-base-300 bg-base-200 p-5">
				<h3 class="text-sm font-bold uppercase tracking-wider opacity-60">Añadir continente</h3>
				<div class="mt-3 grid gap-3 sm:grid-cols-3">
					<label class="form-control">
						<span class="label-text text-xs opacity-60">ID *</span>
						<input class="input input-bordered input-sm" bind:value={ncId} placeholder="centroamerica" />
					</label>
					<label class="form-control">
						<span class="label-text text-xs opacity-60">Etiqueta EN *</span>
						<input class="input input-bordered input-sm" bind:value={ncEn} placeholder="Central America" />
					</label>
					<label class="form-control">
						<span class="label-text text-xs opacity-60">Etiqueta ES *</span>
						<input class="input input-bordered input-sm" bind:value={ncEs} placeholder="Centroamérica" />
					</label>
				</div>
				{#if ncErrors.length}
					<ul class="mt-3 list-inside list-disc text-sm text-error">
						{#each ncErrors as e}
							<li>{e}</li>
						{/each}
					</ul>
				{/if}
				<div class="mt-3 flex justify-end">
					<button class="btn btn-primary btn-sm" onclick={addContinent}>Añadir</button>
				</div>
			</div>
		{:else}
			<div class="card border border-base-300 bg-base-200 p-5">
				<h3 class="font-bold">Datos del servidor</h3>
				<p class="mt-1 text-sm text-base-content/60">
					Todo lo que guardes queda en el disco del servidor (<span class="font-mono">data/overrides.json</span> +
					fotos en <span class="font-mono">data/uploads/</span>) y se publica al instante, sin rebuild.
					Commitea la carpeta <span class="font-mono">data/</span> para conservarlo en git.
				</p>
				<div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{#each countries as c}
						<button
							class="btn btn-sm justify-between"
							onclick={() => downloadJson(`${c.slug}.json`, c)}
						>
							<span class="font-mono">{c.slug}.json</span>
							<span class="opacity-50">↓</span>
						</button>
					{/each}
				</div>

				<div class="divider"></div>

				<h3 class="font-bold">Respaldo y peligro</h3>
				<div class="mt-2 flex flex-wrap gap-2">
					<a class="btn btn-sm" href="/api/admin/export">Descargar respaldo</a>
					<label class="btn btn-sm">
						Restaurar respaldo
						<input type="file" accept="application/json" class="hidden" onchange={onImportFile} />
					</label>
					<button class="btn btn-sm text-error" onclick={doReset}>Descartar todo</button>
				</div>
				{#if importMsg}
					<p class="mt-2 text-sm">{importMsg}</p>
				{/if}
			</div>
		{/if}
	{/if}
</div>
