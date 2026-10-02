import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { writeOverrides, blank } from "$lib/server/store.js";

// POST /api/admin/reset — vacía todos los overrides del servidor
export async function POST({ cookies }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	await writeOverrides(blank());
	return json({ ok: true });
}
