import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { readOverrides, writeOverrides } from "$lib/server/store.js";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// DELETE /api/admin/countries/:slug
export async function DELETE({ cookies, params }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const { slug } = params;
	if (!SLUG_RE.test(slug ?? "")) return json({ error: "slug inválido" }, { status: 400 });
	const o = await readOverrides();
	delete o.countries[slug];
	if (!o.deleted.includes(slug)) o.deleted.push(slug);
	await writeOverrides(o);
	return json({ ok: true });
}
