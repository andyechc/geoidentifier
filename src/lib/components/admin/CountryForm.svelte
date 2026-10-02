<script>
	import { slugifyName } from "$lib/data/live.js";

	// structuredClone revienta con proxies $state: JSON sí los serializa bien
	const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

	// initial: país nuevo o existente · isNew: crea o edita
	// onSave(country, stagedFiles) — stagedFiles: [{ meta: number|null, file }]
	let {
		initial,
		continentIds = [],
		isNew = true,
		errors = [],
		fsReady = false,
		onSave,
		onCancel
	} = $props();

	let f = $state(plain(initial) ?? {});

	// Textareas como strings locales: evita que el cursor salte al escribir
	let imagesText = $state((initial.images ?? []).join("\n"));
	let metas = $state(
		(initial.metas ?? []).map((m) => ({
			title_en: m.title?.en ?? "",
			title_es: m.title?.es ?? "",
			body_en: m.body?.en ?? "",
			body_es: m.body?.es ?? "",
			imagesText: (m.images ?? []).join("\n")
		}))
	);

	// Ficheros pendientes de subir a static/metas/<slug>/ (requiere carpeta conectada)
	let staged = $state([]);

	function lines(v) {
		return String(v ?? "")
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function stageFiles(meta, files) {
		for (const file of files ?? []) {
			if (file) staged = [...staged, { meta, file, name: file.name }];
		}
	}

	function unstage(i) {
		staged = staged.filter((_, j) => j !== i);
	}

	function save() {
		const c = plain(f);
		c.iso = String(c.iso ?? "").toUpperCase();
		c.images = lines(imagesText);
		c.metas = metas.map((m) => ({
			title: { en: m.title_en.trim(), es: m.title_es.trim() },
			body: { en: m.body_en.trim(), es: m.body_es.trim() },
			images: lines(m.imagesText)
		}));
		if (c.facts?.drive?.en === "Left") c.facts.drive.es = "Izquierda";
		if (c.facts?.drive?.en === "Right") c.facts.drive.es = "Derecha";
		onSave?.(c, staged);
	}
</script>

<div class="card border border-base-300 bg-base-200 p-5">
	<div class="grid gap-3 sm:grid-cols-2">
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Slug *</span>
			<div class="flex gap-1.5">
				<input
					class="input input-bordered input-sm font-mono"
					bind:value={f.slug}
					disabled={!isNew}
					placeholder="costa-rica"
				/>
				{#if isNew}
					<button
						type="button"
						class="btn btn-ghost btn-sm shrink-0"
						title="Generar desde el nombre en inglés"
						onclick={() => (f.slug = slugifyName(f.name?.en))}
					>
						↻
					</button>
				{/if}
			</div>
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Continente *</span>
			<select class="select select-bordered select-sm" bind:value={f.continent}>
				{#each continentIds as id}
					<option value={id}>{id}</option>
				{/each}
			</select>
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">ISO (2 letras) *</span>
			<input class="input input-bordered input-sm uppercase" maxlength="2" bind:value={f.iso} placeholder="CR" />
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60"
				>Mapa · nombre Natural Earth (opcional)</span
			>
			<input
				class="input input-bordered input-sm"
				bind:value={f.topo}
				placeholder={f.name?.en || "Costa Rica"}
			/>
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Nombre EN *</span>
			<input class="input input-bordered input-sm" bind:value={f.name.en} placeholder="Costa Rica" />
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Nombre ES *</span>
			<input class="input input-bordered input-sm" bind:value={f.name.es} placeholder="Costa Rica" />
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Conducción *</span>
			<select class="select select-bordered select-sm" bind:value={f.facts.drive.en}>
				<option value="Right">Right (derecha)</option>
				<option value="Left">Left (izquierda)</option>
			</select>
		</label>
		<div class="grid grid-cols-2 gap-3">
			<label class="form-control">
				<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Idioma EN *</span>
				<input class="input input-bordered input-sm" bind:value={f.facts.language.en} placeholder="Spanish" />
			</label>
			<label class="form-control">
				<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Idioma ES *</span>
				<input class="input input-bordered input-sm" bind:value={f.facts.language.es} placeholder="Español" />
			</label>
		</div>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Dominio</span>
			<input class="input input-bordered input-sm" bind:value={f.facts.domain} placeholder=".cr" />
		</label>
		<label class="form-control">
			<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60">Prefijo</span>
			<input class="input input-bordered input-sm" bind:value={f.facts.prefix} placeholder="+506" />
		</label>
	</div>

	<label class="form-control mt-3">
		<span class="label-text text-xs font-bold uppercase tracking-wider opacity-60"
			>Fuente (URL plonkit, opcional)</span
		>
		<input class="input input-bordered input-sm" bind:value={f.source} placeholder="https://www.plonkit.net/..." />
	</label>

	<div class="mt-3 rounded-xl border border-base-300 bg-base-100 p-3">
		<p class="text-xs font-bold uppercase tracking-wider opacity-60">Fotos del país</p>
		<textarea
			class="textarea textarea-bordered textarea-sm mt-2 font-mono text-xs"
			rows="3"
			bind:value={imagesText}
			placeholder="/metas/costa-rica/01.jpg (una URL por línea)"
		></textarea>
		<div class="mt-2 flex flex-wrap items-center gap-2">
			<label class="btn btn-ghost btn-xs {fsReady ? '' : 'btn-disabled'}">
				+ Subir fotos
				<input
					type="file"
					accept="image/*"
					multiple
					class="hidden"
					disabled={!fsReady}
					onchange={(e) => {
						stageFiles(null, e.currentTarget.files);
						e.currentTarget.value = "";
					}}
				/>
			</label>
			{#if !fsReady}
				<span class="text-[11px] opacity-50">Conecta la carpeta del proyecto (pestaña Exportar) para subir.</span>
			{/if}
		</div>
		{#if staged.filter((s) => s.meta === null).length}
			<ul class="mt-2 space-y-1">
				{#each staged as s, i}
					{#if s.meta === null}
						<li class="flex items-center justify-between gap-2 rounded-lg bg-base-200 px-2 py-1 text-xs">
							<span class="truncate font-mono">↗ {s.name}</span>
							<button class="btn btn-ghost btn-xs shrink-0" onclick={() => unstage(i)}>quitar</button>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>

	<div class="mt-4 flex items-center justify-between">
		<h3 class="text-sm font-bold uppercase tracking-wider opacity-60">Metas ({metas.length})</h3>
		<button
			class="btn btn-sm btn-ghost"
			onclick={() =>
				(metas = [
					...metas,
					{ title_en: "", title_es: "", body_en: "", body_es: "", imagesText: "" }
				])}
		>
			+ Añadir meta
		</button>
	</div>

	<div class="mt-2 grid gap-3">
		{#each metas as m, i}
			<details class="rounded-xl border border-base-300 bg-base-100 p-3" open={i === 0}>
				<summary class="flex cursor-pointer items-center justify-between gap-2 text-sm font-bold">
					<span class="truncate">{m.title_en || m.title_es || `Meta ${i + 1} (sin título)`}</span>
					<button
						class="btn btn-ghost btn-xs shrink-0 text-error"
						onclick={(e) => {
							e.preventDefault();
							metas = metas.filter((_, j) => j !== i);
							staged = staged
								.filter((s) => s.meta !== i)
								.map((s) => (s.meta !== null && s.meta > i ? { ...s, meta: s.meta - 1 } : s));
						}}
					>
						Quitar
					</button>
				</summary>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<label class="form-control">
						<span class="label-text text-xs opacity-60">Título EN *</span>
						<input class="input input-bordered input-sm" bind:value={m.title_en} />
					</label>
					<label class="form-control">
						<span class="label-text text-xs opacity-60">Título ES *</span>
						<input class="input input-bordered input-sm" bind:value={m.title_es} />
					</label>
					<label class="form-control sm:col-span-2">
						<span class="label-text text-xs opacity-60">Texto EN *</span>
						<textarea class="textarea textarea-bordered textarea-sm" rows="3" bind:value={m.body_en}
						></textarea>
					</label>
					<label class="form-control sm:col-span-2">
						<span class="label-text text-xs opacity-60">Texto ES *</span>
						<textarea class="textarea textarea-bordered textarea-sm" rows="3" bind:value={m.body_es}
						></textarea>
					</label>
					<div class="form-control sm:col-span-2">
						<span class="label-text text-xs opacity-60">Fotos (una URL por línea)</span>
						<textarea
							class="textarea textarea-bordered textarea-sm font-mono text-xs"
							rows="2"
							bind:value={m.imagesText}
						></textarea>
						<div class="mt-2 flex flex-wrap items-center gap-2">
							<label class="btn btn-ghost btn-xs {fsReady ? '' : 'btn-disabled'}">
								+ Subir fotos
								<input
									type="file"
									accept="image/*"
									multiple
									class="hidden"
									disabled={!fsReady}
									onchange={(e) => {
										stageFiles(i, e.currentTarget.files);
										e.currentTarget.value = "";
									}}
								/>
							</label>
							{#if staged.some((s) => s.meta === i)}
								<ul class="w-full space-y-1">
									{#each staged as s, k}
										{#if s.meta === i}
											<li class="flex items-center justify-between gap-2 rounded-lg bg-base-200 px-2 py-1 text-xs">
												<span class="truncate font-mono">↗ {s.name}</span>
												<button class="btn btn-ghost btn-xs shrink-0" onclick={() => unstage(k)}>
													quitar
												</button>
											</li>
										{/if}
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</div>
			</details>
		{/each}
	</div>

	{#if errors.length}
		<div class="alert alert-error mt-4">
			<ul class="list-inside list-disc text-sm">
				{#each errors as e}
					<li>{e}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="mt-4 flex justify-end gap-2">
		<button class="btn btn-ghost btn-sm" onclick={onCancel}>Cancelar</button>
		<button class="btn btn-primary btn-sm" onclick={save}>Guardar</button>
	</div>
</div>