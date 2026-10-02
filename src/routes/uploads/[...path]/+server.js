import { uploadAbsPath } from "$lib/server/store.js";
import { readFile } from "node:fs/promises";

const TYPES = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".gif": "image/gif",
	".avif": "image/avif"
};

// GET /uploads/<slug>/<fichero> — sirve fotos subidas desde el admin
export async function GET({ params }) {
	const parts = String(params.path ?? "")
		.split("/")
		.filter(Boolean);
	if (parts.length !== 2 || parts.some((p) => p === ".." || p.includes("\\") || p.startsWith("."))) {
		return new Response("no encontrado", { status: 404 });
	}
	const abs = uploadAbsPath(parts);
	if (!abs) return new Response("no encontrado", { status: 404 });
	let buf;
	try {
		buf = await readFile(abs);
	} catch {
		return new Response("no encontrado", { status: 404 });
	}
	const ext = parts[1].slice(parts[1].lastIndexOf(".")).toLowerCase();
	return new Response(buf, {
		headers: {
			"content-type": TYPES[ext] ?? "application/octet-stream",
			"cache-control": "public, max-age=31536000, immutable"
		}
	});
}
