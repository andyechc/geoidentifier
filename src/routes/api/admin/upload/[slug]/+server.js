import { json } from "@sveltejs/kit";
import { authed } from "$lib/server/auth.js";
import { saveUpload, MAX_IMAGE_BYTES } from "$lib/server/store.js";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// POST /api/admin/upload/:slug — multipart con campo "files" (1..N imágenes)
export async function POST({ cookies, params, request }) {
	if (!authed(cookies)) return json({ error: "no-auth" }, { status: 401 });
	const { slug } = params;
	if (!SLUG_RE.test(slug ?? "")) return json({ error: "slug inválido" }, { status: 400 });
	const form = await request.formData().catch(() => null);
	if (!form) return json({ error: "sin datos" }, { status: 400 });
	const files = form.getAll("files").filter((f) => typeof f?.arrayBuffer === "function");
	if (!files.length) return json({ error: "sin ficheros" }, { status: 400 });
	const paths = [];
	for (const file of files.slice(0, 20)) {
		if (!String(file.type || "").startsWith("image/")) {
			return json({ error: `no es imagen: ${file.name}` }, { status: 422 });
		}
		if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
			return json({ error: `tamaño inválido: ${file.name} (máx 8MB)` }, { status: 422 });
		}
		paths.push(await saveUpload(slug, file));
	}
	return json({ ok: true, paths });
}
