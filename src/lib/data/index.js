import { base } from "$app/paths";

const modules = import.meta.glob("./*/*.json", { eager: true });

const px = (u) => (typeof u === "string" && u.startsWith("/") ? `${base}${u}` : u);
const withBase = (c) => ({
	...c,
	images: (c.images ?? []).map(px),
	metas: (c.metas ?? []).map((m) => ({ ...m, images: (m.images ?? []).map(px) }))
});

const all = Object.values(modules).map((m) => withBase(m.default ?? m));

/** Every country, all continents, sorted by English name. */
export const allCountries = all.sort((a, b) => a.name.en.localeCompare(b.name.en));

/** Continents that ship with data, in display order (editado desde el admin). */
import registry from "./continents.json";

export const CONTINENTS = registry;

export const CONTINENT_IDS = CONTINENTS.map((c) => c.id);

export function countriesOf(continent) {
	return allCountries.filter((c) => c.continent === continent);
}

export function continentMeta(id) {
	return CONTINENTS.find((c) => c.id === id);
}

export function getCountry(slug) {
	return allCountries.find((c) => c.slug === slug);
}

export function isoToFlag(iso) {
	return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}