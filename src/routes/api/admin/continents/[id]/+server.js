import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { readOverrides, writeOverrides } from "$lib/server/store.js";
import { visibleCountries, seedServerState } from "$lib/data/live.js";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// DELETE /api/admin/continents/:id (solo si no tiene países visibles)
export async function DELETE({ cookies, params }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const { id } = params;
	if (!SLUG_RE.test(id ?? "")) return json({ error: "id inválido" }, { status: 400 });
	const o = await readOverrides();
	seedServerState(o);
	const n = visibleCountries().filter((c) => c.continent === id).length;
	if (n > 0) return json({ error: "tiene países", count: n }, { status: 400 });
	o.continents = (o.continents ?? []).filter((c) => c.id !== id);
	if (!o.deletedContinents.includes(id)) o.deletedContinents.push(id);
	await writeOverrides(o);
	return json({ ok: true });
}
