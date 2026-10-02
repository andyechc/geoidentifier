import { env } from "$env/dynamic/private";

// Build estático (Pages, BUILD_STATIC=1): prerenderiza todo con data/.
// Servidor (node): todo dinámico para publicar cambios del admin al instante.
export const prerender = env.BUILD_STATIC === "1";
