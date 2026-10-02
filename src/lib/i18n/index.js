import { register, init } from "svelte-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

register("en", () => Promise.resolve(en));
register("es", () => Promise.resolve(es));

init({ fallbackLocale: "en", initialLocale: "es" });
