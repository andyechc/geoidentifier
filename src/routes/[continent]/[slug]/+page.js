import { allCountries } from "$lib/data/index.js";


export function entries() {
	return allCountries.map((c) => ({ continent: c.continent, slug: c.slug }));
}
