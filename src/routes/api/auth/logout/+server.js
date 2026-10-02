import { json } from "@sveltejs/kit";
import { destroy, COOKIE } from "$lib/server/auth.js";

export async function POST({ cookies }) {
	destroy(cookies);
	cookies.delete(COOKIE, { path: "/" });
	return json({ ok: true });
}
