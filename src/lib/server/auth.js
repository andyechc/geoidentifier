import { randomUUID } from "node:crypto";
import { env } from "$env/dynamic/private";

// Sin defaults a propósito: sin ADMIN_USER/ADMIN_PASS en el entorno, nadie entra.
const USER = env.ADMIN_USER;
const PASS = env.ADMIN_PASS;
const TTL = 24 * 3600 * 1000;

export const COOKIE = "admin_session";

/** token -> expiración (en memoria; se pierde al reiniciar el server) */
const sessions = new Map();
let ops = 0;

function sweep() {
	const now = Date.now();
	for (const [t, exp] of sessions) if (exp < now) sessions.delete(t);
}

export function verify(user, pass) {
	if (!USER || !PASS) return false;
	return user === USER && pass === PASS;
}

export function cookieOpts() {
	return {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 24 * 3600,
		secure: env.ADMIN_COOKIE_SECURE === "1"
	};
}

export function createSession() {
	if (++ops % 50 === 0) sweep();
	const t = randomUUID();
	sessions.set(t, Date.now() + TTL);
	return t;
}

export function authed(cookies) {
	const t = cookies.get(COOKIE);
	if (!t) return false;
	const exp = sessions.get(t);
	if (!exp || exp < Date.now()) {
		sessions.delete(t);
		return false;
	}
	return true;
}

export function destroy(cookies) {
	const t = cookies.get(COOKIE);
	if (t) sessions.delete(t);
}
