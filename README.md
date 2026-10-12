# Tienda Voltio

Tienda online de material eléctrico y domótica (ejercicio del curso ThePower · Agentic, Módulo 2). Catálogo con búsqueda y filtros, carrito persistente, pago con Stripe (modo test) confirmado por webhook, email de confirmación con Resend y panel de pedidos.

Para probar un pago: tarjeta `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · PostgreSQL (Neon) + Prisma 7 · Zustand · Stripe Checkout · Resend · Vitest · GitHub Actions · Vercel.

## Arquitectura

```
Navegador ──► Server Components (catálogo, ficha)      ──► src/lib/catalog.ts ──► Prisma ──► Neon
   │
   ├─ Zustand + localStorage: solo { productId, quantity }[]
   │
   ├─ /carrito ──► getCartLines (acción de lectura: ids → precio y stock reales)
   │          └──► createCheckout (Server Action): valida, relee precios, crea Order PENDING,
   │                                crea la sesión de Stripe y redirige
   │
   ├─ Stripe Checkout (alojado) ──► /checkout/exito (solo lee el pedido)
   │                            └─► /checkout/cancelado (conserva el carrito)
   │
   └─ Stripe ──► POST /api/webhooks/stripe  ◄── única fuente de verdad del pago
                   verifica firma → StripeEvent (idempotencia) → Order PAID + stock + email

/admin (middleware + cookie httpOnly) ──► lista con filtro por estado, detalle y transiciones
```

Piezas clave:

| Ruta / fichero | Qué hace |
|---|---|
| `src/lib/catalog.ts` | Consultas del catálogo (las páginas no llaman a Prisma directamente) |
| `src/lib/filters.ts` | Validación de todo lo que llega por la URL o el navegador |
| `src/lib/pricing.ts` | Subtotal, envío (gratis desde 50 €, si no 4,95 €) y total, en céntimos |
| `src/lib/cart-store.ts` | Carrito (Zustand + `persist`) |
| `src/app/carrito/checkout-action.ts` | Server Action de pago |
| `src/lib/fulfillment.ts` | Lógica del webhook: pago confirmado, caducidad, stock, idempotencia |
| `src/app/api/webhooks/stripe/route.ts` | Route Handler del webhook |
| `src/lib/email.ts` | Email de confirmación (Resend); si falla no afecta al pedido |
| `src/lib/admin-token.ts`, `src/middleware.ts` | Sesión del admin (HMAC en cookie httpOnly) |
| `src/lib/order-status.ts` | Estados y transiciones permitidas |

Reglas que se respetan: dinero siempre en céntimos (`Int`); el navegador solo envía ids y cantidades; el estado `PAID` solo lo pone el webhook tras verificar la firma; solo claves `sk_test_`; Stripe solo en servidor.

Más detalle: `docs/SPEC.md` (qué se construye), `docs/DECISIONES.md` (decisiones tomadas), `docs/CONFIGURACION-MANUAL.md` (pasos manuales en Stripe, Resend, Vercel y GitHub).

## Puesta en marcha

```bash
npm install              # el postinstall genera el cliente Prisma
cp .env.example .env     # y rellena las variables
npm run db:deploy        # aplica las migraciones
npm run seed             # 4 categorías y 12 productos
npm run dev              # http://localhost:3000
```

Para recibir webhooks en local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` y copia el `whsec_…` que imprime a `STRIPE_WEBHOOK_SECRET`.

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `seed`, `db:check`, `stripe:check`, `db:migrate`, `db:deploy`, `db:studio`.

## Tests y CI

`npm test` ejecuta los tests de Vitest (funciones puras: filtros, importes, validación del carrito, estados, token de admin, email). El workflow `.github/workflows/ci.yml` ejecuta lint, tipos, tests y build en cada push con variables ficticias.
