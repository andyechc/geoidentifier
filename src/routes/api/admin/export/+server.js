import { authed } from "$lib/server/auth.js";
import { readOverrides } from "$lib/server/store.js";
import { json } from "@sveltejs/kit";

// GET /api/admin/export — descarga el overrides.json del servidor
export async function GET({ cookies }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const o = await readOverrides();
	return new Response(JSON.stringify(o, null, 2) + "\n", {
		headers: {
			"content-type": "application/json",
			"content-disposition": 'attachment; filename="geoguessr-overrides-backup.json"'
		}
	});
}
