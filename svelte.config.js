import adapterNode from "@sveltejs/adapter-node";
import adapterStatic from "@sveltejs/adapter-static";

// Local / servidor:        npm run build          -> adapter-node (admin + API)
// GitHub Pages (estático):   npm run build:static  -> adapter-static + prerender
const isStatic = process.env.ADAPTER === "static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: isStatic
			? adapterStatic({ pages: "build", assets: "build", fallback: "404.html" })
			: adapterNode()
	}
};

export default config;
