// Copia data/uploads/** -> static/uploads/** para que las fotos subidas
// desde el admin viajen también en el build estático (GitHub Pages).
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const from = path.join(root, "data", "uploads");
const to = path.join(root, "static", "uploads");

async function* walk(dir) {
	for (const e of await fs.readdir(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) yield* walk(p);
		else if (!e.name.startsWith(".")) yield p;
	}
}

let n = 0;
try {
	await fs.mkdir(to, { recursive: true });
	for await (const src of walk(from)) {
		const rel = path.relative(from, src);
		const dst = path.join(to, rel);
		await fs.mkdir(path.dirname(dst), { recursive: true });
	 const [a, b] = await Promise.all([
			fs.readFile(src).catch(() => null),
			fs.readFile(dst).catch(() => null)
		]);
		if (!a || !b || !a.equals(b)) {
			await fs.writeFile(dst, a);
			n += 1;
		}
	}
	console.log(`sync-uploads: ${n} fichero(s) copiados a static/uploads`);
} catch (e) {
	if (e?.code === "ENOENT") console.log("sync-uploads: sin data/uploads, nada que copiar");
	else throw e;
}
