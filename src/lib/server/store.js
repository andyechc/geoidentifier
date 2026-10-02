import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "$env/dynamic/private";
import { slugifyName } from "$lib/data/live.js";

export const DATA_DIR = path.resolve(env.GEOGUIDES_DATA_DIR ?? "data");
const FILE = path.join(DATA_DIR, "overrides.json");
const UPLOADS = path.join(DATA_DIR, "uploads");

export function blank() {
	return { countries: {}, deleted: [], continents: [], deletedContinents: [] };
}

export function normalize(raw) {
	const o = typeof raw === "object" && raw !== null ? raw : {};
	return {
		countries: typeof o.countries === "object" && o.countries !== null ? o.countries : {},
		deleted: Array.isArray(o.deleted) ? o.deleted.filter((s) => typeof s === "string") : [],
		continents: Array.isArray(o.continents)
			? o.continents.filter((c) => c && typeof c.id === "string")
			: [],
		deletedContinents: Array.isArray(o.deletedContinents)
			? o.deletedContinents.filter((s) => typeof s === "string")
			: []
	};
}

export async function readOverrides() {
	try {
		return normalize(JSON.parse(await fs.readFile(FILE, "utf-8")));
	} catch {
		return blank();
	}
}

export async function writeOverrides(o) {
	await fs.mkdir(DATA_DIR, { recursive: true });
	const clean = normalize(o);
	await fs.writeFile(FILE, JSON.stringify(clean, null, 2) + "\n");
	return clean;
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function sanitizeImageName(name) {
	const raw = String(name || "foto.jpg");
	const dot = raw.lastIndexOf(".");
	let ext = dot >= 0 ? raw.slice(dot).toLowerCase() : ".jpg";
	if (!IMAGE_EXT.has(ext)) ext = ".jpg";
	const stem = slugifyName(dot >= 0 ? raw.slice(0, dot) : raw).slice(0, 60) || "foto";
	return `${stem}${ext}`;
}

/** Guarda un File en data/uploads/<slug>/ con nombre único. Devuelve la ruta web. */
export async function saveUpload(slug, file) {
	const dir = path.join(UPLOADS, slug);
	await fs.mkdir(dir, { recursive: true });
	const safe = sanitizeImageName(file.name);
	const dot = safe.lastIndexOf(".");
	const stem = safe.slice(0, dot);
	const ext = safe.slice(dot);
	let name = safe;
	let i = 2;
	while (true) {
		try {
			await fs.access(path.join(dir, name));
			name = `${stem}-${i}${ext}`;
			i += 1;
		} catch {
			break;
		}
	}
	const buf = Buffer.from(await file.arrayBuffer());
	await fs.writeFile(path.join(dir, name), buf);
	return `/uploads/${slug}/${name}`;
}

export function uploadAbsPath(parts) {
	const abs = path.resolve(UPLOADS, ...parts);
	if (abs !== UPLOADS && !abs.startsWith(UPLOADS + path.sep)) return null;
	return abs;
}
