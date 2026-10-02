import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { readOverrides, writeOverrides } from "$lib/server/store.js";
import { validateContinent, continentIds } from "$lib/data/live.js";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// POST /api/admin/continents — crear o actualizar un continente
export async function POST({ request, cookies }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const c = await request.json().catch(() => null);
	if (!c || typeof c.id !== "string" || !SLUG_RE.test(c.id)) {
		return json({ error: "id inválido" }, { status: 400 });
	}
	const o = await readOverrides();
	const taken = new Set(continentIds());
	const isNew = !taken.has(c.id);
	const errs = validateContinent(c, { takenIds: isNew ? taken : new Set() });
	if (errs.length) return json({ error: "validation", details: errs }, { status: 422 });
	o.deletedContinents = (o.deletedContinents ?? []).filter((s) => s !== c.id);
	o.continents = (o.continents ?? []).filter((x) => x.id !== c.id);
	o.continents.push({ id: c.id, label: c.label });
	await writeOverrides(o);
	return json({ ok: true, continent: { id: c.id, label: c.label } });
}
