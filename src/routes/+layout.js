// Sin prerender: cada petición renderiza en servidor con los overrides
// actuales del disco, así los cambios del admin salen publicados al instante.
export const prerender = false;

export async function load({ fetch }) {
	try {
		const r = await fetch("/api/overrides");
		if (r.ok) return { overrides: await r.json() };
	} catch {
		/* sin backend (build) -> datos base */
	}
	return { overrides: null };
}
