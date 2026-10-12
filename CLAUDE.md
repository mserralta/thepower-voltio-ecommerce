# Tienda online — contexto del proyecto

**Tienda Voltio** (nombre fijo, no cambiar nunca ni siquiera si el material del curso dice otra cosa): tienda online de material eléctrico y domótica (ejercicio del curso ThePower · Agentic, Módulo 2). La especificación funcional está en `docs/SPEC.md`: léela antes de añadir páginas o cambiar reglas de negocio, y actualízala si algo cambia.

El estado del trabajo y el siguiente paso están en `docs/PROGRESO.md`: léelo al empezar cada sesión y actualízalo al terminar.

Los requisitos del curso (dependencias, alcance, reglas no negociables) están en `docs/REQUISITOS.md`. `docs/SPEC.md` está alineada con ellos.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 (configuración en `src/app/globals.css` con `@theme`, no hay `tailwind.config`)
- PostgreSQL en Neon + Prisma ORM 7 (`prisma/schema.prisma`, config en `prisma.config.ts`). El cliente se genera en `src/generated/prisma` (no versionado; `postinstall` lo regenera) y se conecta con `@prisma/adapter-pg` (`PrismaPg`). Importa los tipos desde `@/generated/prisma/client`.
- Carrito: Zustand 5 con `persist` (fase 3). Emails: Resend. Tests: Vitest. CI: GitHub Actions. Despliegue: Vercel
- Consultas del catálogo en `src/lib/catalog.ts`: las páginas no llaman a `prisma` directamente
- Pagos: Stripe Checkout en **modo test**. El pago se confirma por webhook (`src/app/api/webhooks/stripe/route.ts`)
- Secretos en `.env` o `.env.local` (nunca se suben). Las claves están documentadas en `.env.example`

## Comandos

`node_modules/.bin` no existe (`.npmrc` tiene `bin-links=false`), por eso los scripts llaman a `node node_modules/...`. Usa siempre `npm run`:

- `npm run dev` — servidor de desarrollo en http://localhost:3000
- `npm run build` — build de producción (también hace el type-check)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run db:migrate -- --name <nombre>` — crea y aplica una migración (desarrollo)
- `npm run seed` — carga 4 categorías y 12 productos de ejemplo (idempotente)
- `npm run db:check` / `npm run stripe:check` — comprueban la conexión a la base de datos / a Stripe
- `npm test` — tests de Vitest
- Con la base de datos remota y sin terminal interactiva, `migrate dev` falla: genera el SQL con `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` en una carpeta nueva de `prisma/migrations/` y aplícala con `npm run db:deploy`
- `npm run db:generate` — regenera el cliente Prisma tras cambiar el esquema
- `npm run db:studio` — explorador de la base de datos
- No ejecutes `npm run build` con `npm run dev` en marcha: comparten `.next` y el build falla
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — reenvía los webhooks a local (requiere la Stripe CLI)

## Estructura

```
src/
  app/                 rutas (App Router)
    page.tsx           catálogo (/) con filtros q, categoria, min, max
    producto/[slug]/     detalle de producto (por slug, nunca por id)
    carrito/ checkout/{exito,cancelado}/ admin/
    api/webhooks/stripe/  webhook de Stripe (Route Handler)
  components/          componentes reutilizables (PascalCase.tsx)
  lib/                 datos, tipos y utilidades (sin JSX): prisma.ts, stripe.ts, format.ts, filters.ts
prisma/                schema.prisma, migrations/, seed.ts
docs/                  SPEC.md (qué se construye), REQUISITOS.md (curso), PROGRESO.md (estado)
scripts/               db-check.ts, stripe-check.ts
```

## Convenciones

- **Idioma** (regla fija, sin excepciones):
  - **En inglés, siempre**: todo el código: variables, funciones, tipos, clases, componentes, nombres de fichero, modelos/campos/enums de Prisma y columnas de la base de datos (`Product.priceCents`, `OrderStatus.PAID`), claves de objetos y props.
  - **En español**: textos visibles de la UI, rutas/URLs y parámetros de URL (`/producto/[slug]`, `/carrito`, `/checkout/exito`, `?categoria=`), comentarios, commits y documentación.
  - Si un parámetro de URL en español se corresponde con un campo en inglés, se traduce en el borde (`sp.categoria` → `filters.category`).
- **Server Components por defecto**. Añade `"use client"` sólo en el componente hoja que necesite estado o eventos, no en páginas enteras.
- **Mutaciones** con Server Actions, no API routes. La única excepción es el webhook de Stripe, que es un Route Handler.
- **Base de datos**: accede siempre a través del cliente Prisma único de `src/lib/prisma.ts`. Los cambios de esquema se hacen con `prisma migrate dev`, nunca con `db push`. Las operaciones que tocan pedido y stock van dentro de `prisma.$transaction`.
- **Stripe**: los precios se calculan siempre en el servidor, desde la base de datos. El estado `PAID` solo lo pone el webhook, después de verificar la firma, y el webhook debe ser idempotente (tabla `StripeEvent`). Usa solo claves `sk_test_`.
- **Dinero**: siempre enteros en céntimos, también en base de datos: columnas `Int` de Prisma con sufijo `Cents` (12,95 € → `1295`), nunca `Float` ni `Decimal`. Se pasan a Stripe tal cual (`unit_amount`). Formatea sólo en la UI con `formatPrice()` de `src/lib/format.ts`. Nunca uses floats para importes.
- **URLs de producto**: siempre con el `slug` (`/producto/cable-h07v-k-1-5-mm-rollo-100-m`), nunca con el `id`. El slug es único, solo `a-z0-9-` y se valida con `isValidSlug()` antes de consultar. El seed lo genera del nombre; al crear productos (admin) hay que generarlo igual y garantizar que sea único.
- **Imports** con el alias `@/` (`@/lib/catalog`, `@/components/Header`).
- **Tipos**: `type` en lugar de `interface`; tipos del dominio en `src/lib/types.ts` (aún no creado).
- **Estilos**: sólo utilidades de Tailwind. Colores de marca vía tokens de `@theme` en `globals.css` (`bg-brand`, `text-ink`), no hex sueltos en componentes.
- **Accesibilidad**: imágenes con `alt`, botones reales (`<button>`) para acciones, enlaces (`<Link>`) para navegación.
- **Reglas del curso** (detalle en `docs/REQUISITOS.md`):
  - En Next 15, `params` y `searchParams` son Promises: `await`.
  - `redirect()` siempre fuera de `try/catch`.
  - Todo lo que llega por la URL (ids, filtros, estados) se valida.
  - Cada Server Action comprueba quién llama y qué pide, además del middleware.
  - La clave de Stripe solo en servidor (`import "server-only"`), sin `NEXT_PUBLIC_`.
  - El navegador envía solo ids y cantidades; los precios salen de la base de datos.
  - Un commit por paso.
  - Versiones importantes fijadas (sin `^`); no usar `npm audit fix --force` a ciegas.
  - `.gitignore` debe llevar `!.env.example` para que se suba.
- Componentes pequeños; si una página pasa de ~150 líneas, extrae componentes.

## Antes de dar algo por terminado

1. `npm run lint` y `npm run build` sin errores.
2. Comprueba la página en el navegador (`npm run dev`).
3. Si cambió el comportamiento, actualiza `docs/SPEC.md`.
