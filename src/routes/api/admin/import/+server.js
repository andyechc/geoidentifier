import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { readOverrides, writeOverrides, normalize } from "$lib/server/store.js";

// POST /api/admin/import — fusiona un respaldo de overrides (gana lo entrante)
export async function POST({ request, cookies }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const incoming = normalize(await request.json().catch(() => null));
	const o = await readOverrides();
	for (const [k, v] of Object.entries(incoming.countries)) o.countries[k] = v;
	for (const s of incoming.deleted) if (!o.deleted.includes(s)) o.deleted.push(s);
	const byId = new Map(o.continents.map((c) => [c.id, c]));
	for (const c of incoming.continents) byId.set(c.id, c);
	o.continents = [...byId.values()];
	for (const s of incoming.deletedContinents)
		if (!o.deletedContinents.includes(s)) o.deletedContinents.push(s);
	const saved = await writeOverrides(o);
	return json({
		ok: true,
		countries: Object.keys(saved.countries).length,
		continents: saved.continents.length
	});
}
