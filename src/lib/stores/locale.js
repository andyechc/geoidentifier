import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { locale as i18nLocale } from "svelte-i18n";

export const locales = [
	{ code: "es", label: "Español" },
	{ code: "en", label: "English" }
];

const KEY = "geoguides-locale";

function initial() {
	if (!browser) return "es";
	try {
		const s = localStorage.getItem(KEY);
		if (s === "es" || s === "en") return s;
	} catch { /* ignore */ }
	return "es";
}

export const locale = writable(initial());

if (browser) i18nLocale.set(initial());

locale.subscribe((v) => {
	i18nLocale.set(v);
	if (browser) {
		try {
			localStorage.setItem(KEY, v);
			document.documentElement.setAttribute("lang", v);
		} catch { /* ignore */ }
	}
});
