import { json } from "@sveltejs/kit";
import { verify, createSession, cookieOpts, COOKIE } from "$lib/server/auth.js";

export async function POST({ request, cookies }) {
	const { user, pass } = await request.json().catch(() => ({}));
	if (!verify(user, pass)) return json({ ok: false }, { status: 401 });
	cookies.set(COOKIE, createSession(), cookieOpts());
	return json({ ok: true });
}
