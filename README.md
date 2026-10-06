# GeoIdentifier

Guías de identificación de países para GeoGuessr — identifica el país, no la región.
Bilingüe (ES/EN), con práctica por continente y globo interactivo.

**En vivo:** https://andyechc.github.io/geoidentifier/ · **Repo:** https://github.com/andyechc/geoidentifier

## Contenido

- **29 países, 250 metas** con foto: 18 de África + 11 de Sudamérica.
- Cada meta: título y texto en EN/ES + fotos enlazadas a su texto.
- Ficha por país: bandera, fuente, datos rápidos (conducción, idioma, dominio, prefijo) y shape con localizador en su continente.
- **Modo práctica**: general (`/drill`) o por continente, con racha, progreso y atajos de teclado (`1–4`, `Enter`/`Espacio`).

## Stack

SvelteKit 5 + Tailwind CSS 4 + daisyUI · d3-geo + TopoJSON (globo y shapes) · svelte-i18n ·
`adapter-node` (servidor con API) y `adapter-static` (GitHub Pages).

## Uso en local

```bash
npm install
npm run dev        # http://localhost:5173
```

Producción con Node:

```bash
npm run build
ORIGIN=http://localhost:3000 npm start   # http://localhost:3000
```

> `ORIGIN` debe ser la URL pública base; sin ella, el CSRF de SvelteKit bloquea la subida de fotos.

Variables de entorno (todas opcionales):

| Variable              | Defecto | Para qué                                |
| --------------------- | ------- | --------------------------------------- |
| `GEOGUIDES_DATA_DIR`  | `data`  | Dónde guarda el backend sus datos       |
| `ADAPTER`             | node    | `static` para el build de GitHub Pages  |
| `BUILD_STATIC`        | —       | `1` activa prerender en el build        |
| `PAGES_BASE`          | —       | `/geoidentifier` en el build de Pages   |

## Despliegue (GitHub Pages)

Cada push a `main` ejecuta `.github/workflows/deploy.yml`: copia
`data/uploads/` a `static/`, construye en estático con base `/geoidentifier` y
despliega. El sitio es `noindex` + `Disallow: /` en `robots.txt` por decisión
propia (proyecto personal no comercial).

## Datos

- `src/lib/data/<continente>/<slug>.json` — países y metas (base empaquetada).
- `src/lib/data/continents.json` — registro de continentes.
- `static/metas/` y `static/json/topojson/` — fotos y mapas base.
- `data/` — contenido editable + uploads (se commitea).

Textos EN redactados de forma propia; datos de identificación adaptados de
[Plonk It](https://www.plonkit.net/guide) (enlazado como fuente en cada país) e
imagery © Google Street View.
