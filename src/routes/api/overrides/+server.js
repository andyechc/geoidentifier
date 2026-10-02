import { json } from "@sveltejs/kit";
import { readOverrides } from "$lib/server/store.js";

export async function GET() {
	return json(await readOverrides());
}
