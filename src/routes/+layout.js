import { base } from "$app/paths";

export async function load({ fetch }) {
	try {
		const r = await fetch(`${base}/api/overrides`);
		if (r.ok) return { overrides: await r.json() };
	} catch {
		/* sin backend (build) -> datos base */
	}
	return { overrides: null };
}
