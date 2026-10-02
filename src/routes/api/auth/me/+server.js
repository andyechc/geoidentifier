import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";

export async function GET({ cookies }) {
	return json({ authed: authed(cookies) });
}
