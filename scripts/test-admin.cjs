const { chromium } = require("playwright-core");

(async () => {
	const ADMIN_USER = process.env.ADMIN_USER;
	const ADMIN_PASS = process.env.ADMIN_PASS;
	if (!ADMIN_USER || !ADMIN_PASS) {
		console.error("Falta ADMIN_USER / ADMIN_PASS en el entorno (.env).");
		process.exit(2);
	}
	const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
	const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
	const errors = [];
	page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
	page.on("console", (m) => {
		if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 200));
	});

	const step = async (name, fn) => {
		try {
			await fn();
			console.log("ok -", name);
		} catch (e) {
			console.log("FAIL -", name, "::", String(e.message).split("\n")[0]);
		}
	};

	await step("load admin", () =>
		page.goto("http://localhost:3000/auth/admin", { waitUntil: "domcontentloaded", timeout: 15000 })
	);
	await step("login", async () => {
		await page.fill('input[autocomplete="username"]', ADMIN_USER);
		await page.fill('input[autocomplete="current-password"]', ADMIN_PASS);
		await page.click("text=Entrar");
		await page.waitForSelector("text=Panel admin", { timeout: 8000 });
	});
	await step("paises list (Botswana)", () =>
		page.waitForSelector("text=Botswana", { timeout: 8000 })
	);
	await step("click Editar", async () => {
		await page.getByRole("button", { name: "Editar" }).first().click();
		await page.waitForSelector("text=Volver al listado", { timeout: 8000 });
	});
	await step("form shows slug", () =>
		page.waitForSelector('input[placeholder="costa-rica"]', { timeout: 5000 })
	);
	await step("back to list", async () => {
		await page.click("text=Volver al listado");
		await page.waitForSelector("text=+ Añadir país", { timeout: 8000 });
	});
	await step("Continentes tab", async () => {
		await page.getByRole("button", { name: "Continentes", exact: true }).click();
		await page.waitForSelector("text=Añadir continente", { timeout: 8000 });
	});
	await step("back to Paises tab", async () => {
		await page.getByRole("button", { name: "Países", exact: true }).click();
		await page.waitForSelector("text=+ Añadir país", { timeout: 8000 });
	});
	await step("edit again after tab switch", async () => {
		await page.getByRole("button", { name: "Editar" }).first().click();
		await page.waitForSelector("text=Volver al listado", { timeout: 8000 });
	});
	await step("save country (rename ES title check)", async () => {
		// cambia el nombre ES y guarda -> debe volver al listado con flash
		const es = page.locator('input[placeholder="Costa Rica"]').first();
		await es.fill("Botswana-test");
		await page.getByRole("button", { name: "Guardar", exact: true }).click();
		await page.waitForSelector("text=guardado y publicado", { timeout: 8000 });
	});
	await step("revert change", async () => {
		await page.getByRole("button", { name: "Editar" }).first().click();
		await page.waitForSelector("text=Volver al listado", { timeout: 8000 });
		await page.locator("label", { hasText: "Nombre ES" }).locator("input").fill("Botsuana");
		await page.getByRole("button", { name: "Guardar", exact: true }).click();
		await page.waitForSelector("text=guardado y publicado", { timeout: 8000 });
	});

	console.log("--- JS errors ---");
	console.log(errors.length ? errors.join("\n") : "(none)");
	await browser.close();
	process.exit(0);
})().catch((e) => {
	console.error("FATAL", e.message);
	process.exit(1);
});
