import { CONTINENT_IDS } from "$lib/data/index.js";


export function entries() {
	return CONTINENT_IDS.map((continent) => ({ continent }));
}
