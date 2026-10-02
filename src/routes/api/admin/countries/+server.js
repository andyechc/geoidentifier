import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { readOverrides, writeOverrides } from "$lib/server/store.js";
import { validateCountry } from "$lib/data/live.js";
import { allCountries } from "$lib/data/index.js";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// POST /api/admin/countries?isNew=1 — crear o actualizar un país
export async function POST({ request, cookies, url }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const c = await request.json().catch(() => null);
	if (!c || typeof c.slug !== "string" || !SLUG_RE.test(c.slug)) {
		return json({ error: "slug inválido" }, { status: 400 });
	}
	const o = await readOverrides();
	const taken = new Set([
		...allCountries.map((x) => x.slug),
		...Object.keys(o.countries)
	]);
	taken.delete(c.slug);
	const errs = validateCountry(c, {
		isNew: url.searchParams.get("isNew") === "1",
		takenSlugs: taken
	});
	if (errs.length) return json({ error: "validation", details: errs }, { status: 422 });
	o.deleted = (o.deleted ?? []).filter((s) => s !== c.slug);
	o.countries[c.slug] = c;
	await writeOverrides(o);
	return json({ ok: true, country: c });
}
