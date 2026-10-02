import { writable } from "svelte/store";
import { browser } from "$app/environment";

const KEY = "geoguides-theme";
export const THEMES = ["geo-dark", "geo-light"];

function initial() {
	if (!browser) return "geo-dark";
	try {
		const s = localStorage.getItem(KEY);
		if (THEMES.includes(s)) return s;
	} catch { /* ignore */ }
	return "geo-dark";
}

export const theme = writable(initial());

function apply(v) {
	if (!browser) return;
	document.documentElement.setAttribute("data-theme", v);
	try {
		localStorage.setItem(KEY, v);
	} catch { /* ignore */ }
}

if (browser) apply(initial());
theme.subscribe(apply);

export function toggleTheme() {
	theme.update((v) => (v === "geo-dark" ? "geo-light" : "geo-dark"));
}
