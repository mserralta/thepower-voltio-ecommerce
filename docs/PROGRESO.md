# Progreso — dónde lo dejamos

Última sesión: 2026-10-12. Siguiente paso: **fase 3, carrito (Zustand)**.

Lee primero `CLAUDE.md` (stack y convenciones), `docs/SPEC.md` (qué se construye) y `docs/REQUISITOS.md` (requisitos del curso). Este fichero solo recoge el estado y lo que viene.

## Cómo arrancar

```bash
npm install          # postinstall regenera el cliente Prisma en src/generated/
npm run dev          # http://localhost:3000
```

- `.env` tiene `DATABASE_URL` (Neon). Falta añadir `DIRECT_URL`, las claves de Stripe/Resend y `ADMIN_PASSWORD` cuando se necesiten (ver `.env.example`). Nota: `.env` tiene también `DATABASE_URL_POOLED`, que el código no usa.
- Base de datos migrada y con seed. Si se vacía: `npm run db:deploy` y `npm run seed`.
- No lances `npm run build` con `npm run dev` en marcha (comparten `.next`).

## Estado por fases

| Fase | Estado |
|---|---|
| 1. Esqueleto | ✅ |
| 2. Base de datos y catálogo (filtros `q/categoria/min/max`, ficha) | ✅ adaptada a los requisitos del curso el 2026-10-12 |
| 3. Carrito (Zustand + persist, `/carrito`) | ⏭️ Siguiente |
| 4. Checkout Stripe + webhook + email Resend + éxito/cancelado | Pendiente |
| 5. Admin (middleware + cookie, pedidos) | Pendiente |
| 6. Cierre: README con arquitectura, Vercel, webhook de producción | Pendiente |

## Qué hay hecho

- **Rutas**: `/` (catálogo con búsqueda, categoría y rango de precio) y `/producto/[slug]` (404 si el slug es inválido o no existe). `/carrito`, `/checkout/*` y `/admin` aún dan 404 (la cabecera enlaza a `/carrito` y `/admin`).
- **Datos**: 4 categorías y 12 productos (Tapo E27 con stock 0). Modelos en inglés: `Category`, `Product`, `Order`, `OrderItem`, `OrderStatus`, `StripeEvent`. Migraciones `20261012130000_slug_de_producto` (añade `Product.slug` único; rellena el existente con el sku y el seed lo sobrescribe), `20261012100000_adaptar_requisitos_curso` (nombres en español) y `20261012120000_identificadores_en_ingles` (vuelta al inglés por decisión del usuario; solo había datos de seed, recargados con `npm run seed`).
- **Código clave**: `src/lib/prisma.ts` (PrismaPg), `src/lib/stripe.ts` (`server-only`, exige `sk_test_`), `src/lib/catalog.ts`, `src/lib/filters.ts` (validación pura de la URL: `parseFilters`, `isValidSlug`), `scripts/db-check.ts`, `scripts/stripe-check.ts`.
- **Tests y CI**: 5 tests Vitest en `src/lib/filters.test.ts`; workflow en `.github/workflows/ci.yml` (lint, typecheck, test, build con variables ficticias).
- **Verificado**: `npm run lint`, `npm test`, `npm run build` OK; humo en local de filtros, ficha y 404.

## Decisiones tomadas

- Se adaptó el proyecto a los requisitos del curso (rutas en español, 4 categorías/12 productos, adapter `pg`, "Tienda Voltio").
- **Enlaces de producto con slug, no id** (regla del usuario): `/producto/[slug]`. Slug generado del nombre en el seed (`slugify`).
- **Nombre de la tienda: "Tienda Voltio"**, fijo e inmutable (regla del usuario). Aparece en `Header`, `layout.tsx` y los títulos de página.
- **Idioma (regla fija del usuario)**: código y base de datos siempre en inglés; UI, rutas, URLs, comentarios, commits y docs en español. Ver `CLAUDE.md`.
- Prisma fijado a **7.10.0**; `stripe` 22.6.2 (rama 22.x del curso; hay 23.x); `@types/node` 24. Versiones sin `^` en lo importante.
- Stripe Checkout alojado; Stripe recoge la dirección (solo España).
- Precios con IVA 21 % incluido, envío gratis desde 50 € (si no, 4,95 €).
- Sin reserva de stock durante el pago; carrera por la última unidad → `problemaStock`.
- Se mantienen `brand`, `sku` y `specs` en `Product` (más allá del mínimo del curso).

## Pendiente de instalar (se hará en su fase)

- `zustand` (fase 3), `resend` (fase 4), shadcn/ui (`npx shadcn@latest init --defaults`; componentes card, badge, input, select, separator, sonner, sheet, button) — decidir si se adopta antes de construir más UI. La UI actual es solo Tailwind.
- `dotenv` no se instaló: los scripts usan `@next/env`, que ya carga `.env`.
- Docker/Postgres local: opcional, no se usa.

## Fase 3 — plan

1. `zustand` fijado; store `src/lib/cart.ts` (o `src/stores/`) con `persist`, solo `{ productId, quantity }[]`; total y nº de artículos calculados.
2. `AddToCartButton` (componente cliente) con selector de cantidad (máx. = stock; desactivado si agotado) en `/producto/[slug]`.
3. Contador en la cabecera (componente cliente pequeño).
4. `/carrito`: pide al servidor nombres, precios y stock actuales por `productId` (el carrito guarda ids, no slugs; hay que añadir un validador de id tipo cuid en `filters.ts`, que se quitó al pasar a slugs); nunca muestra precios guardados en el navegador. Avisa y ajusta si falta stock o el producto ya no existe.
5. Subtotal/envío/total en céntimos, lógica pura en `src/lib/` con tests (reutilizable en el checkout).
6. Al terminar: lint, build, navegador, actualizar SPEC y este fichero.

## Pendiente / ideas sueltas

- Fotos de producto (`imageUrl`): decidir alojamiento y `images.remotePatterns`.
- `createdAt` es igual en todo el seed.
- `npm audit` avisa de vulnerabilidades sin revisar (no usar `--force` a ciegas).
- El proyecto no es un repositorio git todavía; los requisitos piden un commit por paso, GitHub y CI en verde.
- README.md es el de `create-next-app`: sustituirlo por la arquitectura (fase 6).
- `DATABASE_URL_POOLED` en `.env`: unificar con `DATABASE_URL` (pooler) y `DIRECT_URL` (directa).
