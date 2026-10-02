import { get, writable } from "svelte/store";
import { allCountries, CONTINENTS as BASE_CONTINENTS } from "./index.js";
import { TOPO_TO_SLUG, SLUG_TO_TOPO } from "../map.js";
import { CONTINENT_MEMBERS } from "../continents.js";

export { isoToFlag } from "./index.js";

/** Se incrementa en cada mutación para que las vistas se refresquen sin recargar. */
export const dataRev = writable(0);
function touch() {
	try {
		dataRev.update((n) => n + 1);
	} catch {
		/* ignore */
	}
}

// ---------------------------------------------------------------------------
// Overrides del panel admin (/auth/admin). Viven en el SERVIDOR
// (data/overrides.json) y se fusionan sobre los datos empaquetados.
// Forma: { countries: {slug: country}, deleted: [slug],
//          continents: [{id,label:{en,es}}], deletedContinents: [id] }
// ---------------------------------------------------------------------------

export const LEGACY_STORE_KEY = "geoguides-admin-v1";

/** Estado traído del servidor (lo siembra +layout.js con /api/overrides). */
export const serverState = writable(null);

export function seedServerState(o) {
	serverState.set(normalize(o));
}

function blank() {
	return { countries: {}, deleted: [], continents: [], deletedContinents: [] };
}

function normalize(raw) {
	const o = typeof raw === "object" && raw !== null ? raw : {};
	return {
		countries:
			typeof o.countries === "object" && o.countries !== null ? o.countries : {},
		deleted: Array.isArray(o.deleted) ? o.deleted.filter((s) => typeof s === "string") : [],
		continents: Array.isArray(o.continents)
			? o.continents.filter((c) => c && typeof c.id === "string")
			: [],
		deletedContinents: Array.isArray(o.deletedContinents)
			? o.deletedContinents.filter((s) => typeof s === "string")
			: []
	};
}

/** Overrides efectivos: servidor si llegó, base vacía si no. */
export function loadOverrides() {
	return normalize(get(serverState));
}

export async function refreshServerState(fetchFn = fetch) {
	try {
		const r = await fetchFn("/api/overrides");
		if (r.ok) {
			seedServerState(await r.json());
			touch();
			return true;
		}
	} catch {
		/* sin backend */
	}
	return false;
}

// ---- auth contra el servidor (cookie httpOnly) ----
export async function apiMe(fetchFn = fetch) {
	try {
		const r = await fetchFn("/api/auth/me");
		return r.ok && (await r.json()).authed === true;
	} catch {
		return false;
	}
}

export async function apiLogin(user, pass, fetchFn = fetch) {
	try {
		const r = await fetchFn("/api/auth/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ user, pass })
		});
		return r.ok;
	} catch {
		return false;
	}
}

export async function apiLogout(fetchFn = fetch) {
	try {
		await fetchFn("/api/auth/logout", { method: "POST" });
	} catch {
		/* ignore */
	}
}

async function apiMut(path, opts = {}, fetchFn = fetch) {
	const r = await fetchFn(path, opts);
	let body = null;
	try {
		body = await r.json();
	} catch {
		/* ignore */
	}
	if (!r.ok) {
		const msg =
			body?.error === "validation"
				? (body.details ?? []).join("; ")
				: (body?.error ?? `error ${r.status}`);
		throw new Error(msg);
	}
	await refreshServerState(fetchFn);
	return body;
}

const asJson = (obj) => ({
	method: "POST",
	headers: { "content-type": "application/json" },
	body: JSON.stringify(obj)
});

export const apiSaveCountry = (c, isNew, fetchFn) =>
	apiMut(`/api/admin/countries?isNew=${isNew ? "1" : "0"}`, asJson(c), fetchFn);
export const apiDeleteCountry = (slug, fetchFn) =>
	apiMut(`/api/admin/countries/${slug}`, { method: "DELETE" }, fetchFn);
export const apiSaveContinent = (c, fetchFn) => apiMut("/api/admin/continents", asJson(c), fetchFn);
export const apiDeleteContinent = (id, fetchFn) =>
	apiMut(`/api/admin/continents/${id}`, { method: "DELETE" }, fetchFn);
export const apiImport = (o, fetchFn) => apiMut("/api/admin/import", asJson(o), fetchFn);
export const apiReset = (fetchFn) => apiMut("/api/admin/reset", { method: "POST" }, fetchFn);

export async function apiUpload(slug, file, fetchFn = fetch) {
	const fd = new FormData();
	fd.append("files", file, file.name);
	const r = await fetchFn(`/api/admin/upload/${slug}`, { method: "POST", body: fd });
	const body = await r.json().catch(() => null);
	if (!r.ok) throw new Error(body?.error ?? `error ${r.status}`);
	await refreshServerState(fetchFn);
	return body.paths ?? [];
}

// ---- merged reads (los overrides ganan a la base por id) ----
export function visibleContinents() {
	const o = loadOverrides();
	const del = new Set(o.deletedContinents);
	const map = new Map();
	for (const c of BASE_CONTINENTS) {
		if (!del.has(c.id)) map.set(c.id, c);
	}
	for (const c of o.continents) map.set(c.id, c);
	return [...map.values()];
}

export function continentIds() {
	return visibleContinents().map((c) => c.id);
}

export function visibleCountries() {
	const o = loadOverrides();
	const del = new Set(o.deleted);
	const validContinents = new Set(visibleContinents().map((c) => c.id));
	const map = new Map();
	for (const c of allCountries) {
		if (!del.has(c.slug) && validContinents.has(c.continent)) map.set(c.slug, c);
	}
	for (const c of Object.values(o.countries)) {
		if (!c || typeof c.slug !== "string") continue;
		if (del.has(c.slug) || !validContinents.has(c.continent)) map.delete(c.slug);
		else map.set(c.slug, c);
	}
	return [...map.values()].sort((a, b) =>
		String(a.name?.en ?? a.slug).localeCompare(String(b.name?.en ?? b.slug))
	);
}

export function liveCountriesOf(continent) {
	return visibleCountries().filter((c) => c.continent === continent);
}

export function liveGetCountry(slug) {
	return visibleCountries().find((c) => c.slug === slug) ?? null;
}

/** Nombre Natural Earth para dibujar el shape de un país (override `topo`, o el mapa base). */
export function topoNameFor(slug) {
	const c = liveGetCountry(slug);
	const fromOverride = typeof c?.topo === "string" && c.topo.trim() ? c.topo.trim() : null;
	if (fromOverride) return fromOverride;
	return SLUG_TO_TOPO[slug] ?? null;
}

/**
 * Slug visible para un nombre del TopoJSON del globo. Respeta borrados y
 * empatiza overrides por `topo` o por nombre inglés (para países añadidos
 * a mano como Marruecos, que sí tienen polígono pero no estaban en guías).
 */
export function globeSlugFor(topoName) {
	const vis = new Set(visibleCountries().map((c) => c.slug));
	const base = TOPO_TO_SLUG[topoName];
	if (base && vis.has(base)) return base;
	const needle = String(topoName ?? "")
		.normalize("NFKD")
		.toLowerCase();
	for (const c of visibleCountries()) {
		const cand = [c.topo, c.name?.en].filter(Boolean).map((s) =>
			String(s)
				.normalize("NFKD")
				.toLowerCase()
		);
		if (cand.includes(needle)) return c.slug;
	}
	return null;
}

/** Nombres NE para la silueta de un continente (base completa, o los de sus países en overrides puros). */
export function silhouetteNames(continent) {
	if (CONTINENT_MEMBERS[continent]) return CONTINENT_MEMBERS[continent];
	return liveCountriesOf(continent)
		.map((c) =>
			typeof c.topo === "string" && c.topo.trim() ? c.topo.trim() : c.name?.en
		)
		.filter(Boolean);
}

// ---- validation (mensajes en español para el panel) ----
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateCountry(c, { isNew, takenSlugs }) {
	const errs = [];
	const at = (p, msg) => errs.push(`${p}: ${msg}`);
	if (!c || typeof c !== "object") return ["país: objeto inválido"];
	if (!c.slug || !SLUG_RE.test(c.slug)) at("slug", "usa minúsculas, números y guiones (ej. costa-rica)");
	else if (isNew && takenSlugs.has(c.slug)) at("slug", "ese slug ya existe");
	if (!c.continent) at("continente", "obligatorio");
	else if (!continentIds().includes(c.continent)) at("continente", "desconocido");
	const iso = String(c.iso ?? "").toUpperCase();
	if (!/^[A-Z]{2}$/.test(iso)) at("iso", "exactamente 2 letras (ej. CR)");
	if (!c.name?.en?.trim()) at("nombre.en", "obligatorio");
	if (!c.name?.es?.trim()) at("nombre.es", "obligatorio");
	if (!["Left", "Right"].includes(c.facts?.drive?.en))
		at("facts.drive.en", "tiene que ser Left o Right");
	if (!c.facts?.language?.en?.trim()) at("facts.language.en", "obligatorio");
	if (!c.facts?.language?.es?.trim()) at("facts.language.es", "obligatorio");
	if (c.facts?.domain && !/^\.[a-z]{2,}$/.test(c.facts.domain))
		at("facts.domain", "tiene que empezar por punto (ej. .cr)");
	if (c.facts?.prefix && !/^\+[0-9][0-9 ]*$/.test(c.facts.prefix))
		at("facts.prefix", "tiene que empezar por + y llevar dígitos (ej. +506)");
	if (!Array.isArray(c.metas)) at("metas", "tiene que ser una lista");
	else
		c.metas.forEach((m, i) => {
			const p = `metas[${i + 1}]`;
			if (!m?.title?.en?.trim()) at(`${p}.title.en`, "obligatorio");
			if (!m?.title?.es?.trim()) at(`${p}.title.es`, "obligatorio");
			if (!m?.body?.en?.trim()) at(`${p}.body.en`, "obligatorio");
			if (!m?.body?.es?.trim()) at(`${p}.body.es`, "obligatorio");
			for (const u of m?.images ?? [])
				if (typeof u !== "string" || !u.trim()) at(`${p}.images`, "hay una URL vacía");
		});
	for (const u of c.images ?? [])
		if (typeof u !== "string" || !u.trim()) at("images", "hay una URL vacía");
	return errs;
}

export function validateContinent(c, { takenIds }) {
	const errs = [];
	if (!c?.id || !SLUG_RE.test(c.id)) errs.push("id: usa minúsculas, números y guiones");
	else if (takenIds.has(c.id)) errs.push("id: ese continente ya existe");
	if (!c?.label?.en?.trim()) errs.push("label.en: obligatorio");
	if (!c?.label?.es?.trim()) errs.push("label.es: obligatorio");
	return errs;
}

export function slugifyName(s) {
	return String(s ?? "")
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Etiqueta visible de un continente en el idioma dado. */
export function continentLabel(id, locale) {
	const c = visibleContinents().find((x) => x.id === id);
	if (!c) return id;
	return c.label?.[locale] ?? c.label?.en ?? id;
}

// ---- export ----
export function downloadJson(filename, obj) {
	if (!browser) return;
	const blob = new Blob([JSON.stringify(obj, null, 2) + "\n"], {
		type: "application/json"
	});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		URL.revokeObjectURL(a.href);
		a.remove();
	}, 500);
}
