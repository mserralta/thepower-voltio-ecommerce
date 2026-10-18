# Especificación — Tienda Voltio

> El nombre de la tienda es **Tienda Voltio** y no debe cambiar nunca.

Versión 0.7 · 2026-10-12 · Alineada con `docs/REQUISITOS.md` (requisitos del curso).

**Idioma**: el código y la base de datos (variables, funciones, tipos, modelos, campos, enums, columnas) van **siempre en inglés**. Los textos de la UI, las rutas y parámetros de URL, los comentarios, los commits y la documentación van en español. Esta spec nombra los datos con sus identificadores reales en inglés.

## Objetivo

Tienda online de material eléctrico y domótica ("Tienda Voltio"), desplegada en Vercel, que cualquiera pueda probar pagando con la tarjeta `4242 4242 4242 4242`. Catálogo con búsqueda y filtros, carrito persistente, pago con Stripe confirmado por webhook, email con Resend y panel de pedidos.

## Usuarios

- **Cliente** (anónimo): navega y compra. Sin cuenta.
- **Administrador**: ve y gestiona pedidos. Acceso protegido por contraseña (`ADMIN_PASSWORD`).

## Categorías (4, fijas, creadas con el seed)

| Slug | Nombre |
|---|---|
| `cables` | Cables y conductores |
| `iluminacion` | Iluminación inteligente |
| `automatizacion` | Automatización y actuadores |
| `proteccion` | Protección y mecanismos |

## Páginas

| Ruta | Qué hace |
|---|---|
| `/` | Catálogo. Búsqueda por nombre (`?q=`), categoría (`?categoria=`) y rango de precio en euros enteros (`?min=&max=`). Se resuelve en el servidor con Prisma; los parámetros inválidos se ignoran. |
| `/producto/[slug]` | Detalle: imagen, nombre, marca, SKU, precio con IVA, stock, especificaciones y "Añadir al carrito" con selector de cantidad. El enlace usa el `slug` del producto, nunca el id. 404 si el slug es inválido o no existe. Título por producto. |
| `/carrito` | Líneas con cantidad editable y eliminar, subtotal, envío y total. Botón "Pagar". |
| `/checkout/exito` | Lee el pedido (por `session_id`) y muestra su estado; vacía el carrito. **No confirma nada**: "Pago confirmado" solo si el webhook ya lo marcó `PAID`, si no "Procesando pago…". |
| `/checkout/cancelado` | Volvió de Stripe sin pagar. El carrito se conserva. |
| `/admin` | Lista de pedidos con filtro por estado (`?estado=PAID`…). Protegido con middleware + cookie httpOnly. |
| `/admin/pedidos/[id]` | Detalle del pedido, botones de transición y, si está confirmado (`PAID`, `SHIPPED` o `DELIVERED`), botón «Reenviar email de confirmación». |
| `/admin/productos` | Lista de todos los productos (también ocultos) con precio, stock y visibilidad. |
| `/admin/productos/[id]` | Edita nombre, marca, descripción, precio (€ con hasta 2 decimales, se guarda en céntimos), stock, categoría y visibilidad. `sku` y `slug` no se editan. |
| `/admin/login` | Acceso con `ADMIN_PASSWORD`. |
| `/api/webhooks/stripe` | Webhook de Stripe (Route Handler). |

## Pago con Stripe (modo test)

Stripe Checkout alojado, claves `sk_test_…`.

1. En `/carrito`, "Pagar" ejecuta una **Server Action** que:
   - Valida lo que llega (solo `{ productId, quantity }[]`).
   - Relee precios y stock **de la base de datos**. Si falta stock, devuelve error.
   - Crea el `Order` en `PENDING` con sus `OrderItem` (dentro de `prisma.$transaction`).
   - Crea la Checkout Session (`price_data` en EUR, envío solo a España, `metadata.orderId`, `success_url` / `cancel_url`), guarda `stripeCheckoutSessionId` y redirige. `redirect()` va fuera de `try/catch`.
2. Stripe redirige a `/checkout/exito?session_id={CHECKOUT_SESSION_ID}`.
3. **La fuente de verdad es el webhook.** `POST /api/webhooks/stripe`:
   - Verifica la firma sobre el cuerpo crudo (`await req.text()`); si falla, 400.
   - Idempotente: guarda `event.id` en `StripeEvent`; si ya existe, 200 sin hacer nada.
   - `checkout.session.completed` (pagado): en una transacción pasa a `PAID`, guarda email, nombre, dirección y `paymentIntentId`, y descuenta el stock. Después envía el email de confirmación (una sola vez). Si el email falla, el pedido sigue `PAID`.
   - `checkout.session.async_payment_succeeded`: igual que el anterior (pagos asíncronos).
   - `checkout.session.expired`: pasa a `CANCELLED`. La sesión caduca a los 30 min.
   - Eventos no manejados: 200.
4. En local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. En producción, webhook propio en Stripe con su propio secreto.

## Email (Resend)

Confirmación de pedido con líneas y total, enviada desde el webhook. En pruebas va a `EMAIL_PRUEBAS`.

## Admin

Barra de navegación común (Pedidos · Productos · Salir) en `src/app/admin/layout.tsx`. Cada Server Action de edición de producto comprueba la sesión, valida el formulario (`src/lib/product-input.ts`) y que la categoría exista. Cambiar un precio no altera pedidos ya hechos (tienen copia del precio).

Estados (`OrderStatus`): `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED` (en la UI: pendiente, pagado, enviado, entregado, cancelado). Transiciones permitidas: `PAID→SHIPPED→DELIVERED` y `PENDING→CANCELLED`. Cada Server Action comprueba la sesión de admin y que la transición sea válida, además del middleware.

## Reglas de negocio

- Precios en céntimos (enteros), **IVA 21 % incluido**. Formato con `formatPrice()`.
- Máximo 20 unidades por línea (y nunca más que el stock) y 50 líneas por carrito.
- Envío gratis desde 50 €; si no, 4,95 €. Solo España.
- Todo se vende por unidad; los cables, en rollos de longitud fija (un producto por longitud).
- No se puede añadir más que el stock. Se vuelve a comprobar al crear la sesión de pago.
- El stock se descuenta solo cuando el webhook confirma el pago; sin reserva. Si dos pedidos compiten por la última unidad, el segundo pago se acepta y el pedido se marca `stockIssue = true` para revisión manual.
- Productos con `active = false` no aparecen en la tienda.

## Datos — PostgreSQL (Neon) + Prisma 7

Esquema en `prisma/schema.prisma`; cambios solo con migraciones. Todos los importes son `Int` en céntimos con sufijo `Cents`.

- **Category**: `id`, `slug` (único), `name`, `order`.
- **Product**: `id`, `sku` (único), `slug` (único, para la URL), `name`, `brand`, `description`, `priceCents`, `stock`, `imageUrl`, `specs` (JSON), `active`, `createdAt`, `updatedAt`, `categoryId`.
- **Order**: `id`, `status` (`OrderStatus`), `subtotalCents`, `shippingCents`, `totalCents`, `email`, `customerName`, `shippingAddress` (JSON), `stripeCheckoutSessionId` (único), `stripePaymentIntentId`, `stockIssue`, `createdAt`, `paidAt`.
- **OrderItem**: `id`, `orderId`, `productId`, `skuSnapshot`, `nameSnapshot`, `unitPriceCents`, `quantity` (copia de sku/nombre/precio para que el pedido no cambie).
- **StripeEvent**: `id` (= `event.id`), `type`, `processedAt`. Idempotencia del webhook.

Seed idempotente (por `sku`): 4 categorías y 12 productos; la bombilla Wi-Fi Tapo tiene stock 0 para probar "agotado".

**Carrito**: no está en base de datos. Zustand + `persist` (localStorage), solo `{ productId, quantity }[]`; total y nº de artículos se calculan.

## Variables de entorno

`DATABASE_URL` (pooler), `DIRECT_URL` (directa, migraciones), `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_PRUEBAS`, `ADMIN_PASSWORD`. Van en `.env` / `.env.local` (no se suben); `.env.example` las documenta.

## Tests y CI

Tests de funciones puras con Vitest (`npm test`): filtros, importes, validación del carrito, estados, token de admin y email. GitHub Actions (`.github/workflows/ci.yml`) ejecuta lint, tipos, tests y build en cada push con variables ficticias.

## Fuera de alcance

Cuentas de cliente, cupones, varias monedas, stock en tiempo real, envíos reales, facturas, devoluciones, multi-idioma.

## Fases

1. **Esqueleto**. ✅
2. **Base de datos y catálogo** (Prisma + Neon, seed, filtros `q/categoria/min/max`, ficha). ✅
3. **Carrito** (Zustand + persist, `/carrito`). ✅
4. **Checkout con Stripe**: Server Action, sesión, webhook idempotente, email Resend, `/checkout/exito` y `/checkout/cancelado`. ✅
5. **Admin**: middleware + cookie, pedidos con filtro y transiciones. ✅
6. **Cierre**: README con arquitectura ✅; despliegue en Vercel y webhook de producción: pasos manuales en `docs/CONFIGURACION-MANUAL.md`. shadcn/ui no se adopta (ver `docs/DECISIONES.md`).
7. **Admin ampliado**: gestión de productos existentes (editar), junto con pedidos, detalle y estados. ✅
