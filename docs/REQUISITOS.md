# Requisitos del curso (ThePower · Agentic, Módulo 2)

Fuente: resumen de las 4 sesiones de la documentación del curso. El texto original venía de OCR, así que **algún número de versión puede estar mal leído** (verificar con `npm view` antes de fijarlo). El comando de instalación de Prisma aparecía cortado.

Este documento es la referencia de **qué pide el curso**. `docs/SPEC.md` describe lo que se está construyendo y `docs/PROGRESO.md` el estado. Los puntos donde el proyecto actual se aparta de estos requisitos están en la sección "Desajustes" de `docs/PROGRESO.md`.

## 1. Dependencias

### Entorno y herramientas
- Node.js 20 o superior (el profesor usa la 24 con npm 11).
- Git y un editor (VS Code o similar).
- Stripe CLI, desde la S3 (un `.exe`, sin instalar).
- Docker: opcional, solo como alternativa local a Neon (`postgres:17-alpine`).

### Paquetes del proyecto
- **Base**: Next.js 15 (App Router, `src/`), React 19, TypeScript, Tailwind v4 y ESLint, todo de serie con `create-next-app`.
- **Base de datos**:
  - `prisma` (dev) y `@prisma/client`, ambos fijados a **7.10.0** y sin `^` (`latest` instaló una versión dev 8.x).
  - Adapter de `pg` para Prisma 7 (`PrismaPg`, `@prisma/adapter-pg`) y el driver `pg`.
  - `dotenv` y `tsx` para los scripts.
- **Pagos**: `stripe` (22.x) y `server-only`.
- **UI**:
  - shadcn/ui: `npx shadcn@latest init --defaults`. Versión actual, con Base UI en vez de Radix y `render` + `nativeButton` en vez de `asChild`.
  - Componentes a añadir: card, badge, input, select, separator, sonner, sheet y button.
  - `next/image`, `next/form` y la fuente Geist.
- **Carrito**: `zustand` 5.x con el middleware `persist`.
- **Emails**: `resend`.
- **Tests**: `vitest` 5.x y `@types/node@24` (sin ese ajuste de tipos hay un conflicto ERESOLVE).

### Servicios (cuentas gratuitas)
- Neon (PostgreSQL 18, base llamada `tienda`).
- Stripe en modo test/Sandbox.
- Resend.
- GitHub, con GitHub Actions para el CI.
- Vercel (plan Hobby).

### Variables de entorno
- `DATABASE_URL` (con pooler) y `DIRECT_URL` (directa, para las migraciones).
- `STRIPE_SECRET_KEY` (`sk_test_`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_`) y `STRIPE_WEBHOOK_SECRET` (`whsec_`).
- `RESEND_API_KEY` y `EMAIL_PRUEBAS`.
- `ADMIN_PASSWORD`.

### Scripts de `package.json`
`dev`, `build`, `start`, `lint`, `test`, `postinstall` (`prisma generate`), `seed`, `db:check` y `stripe:check`.

## 2. Requerimientos del proyecto

### Alcance y entregable
- **Nombre de la tienda: "Tienda Voltio" (decisión fija del usuario; el material del curso dice "Tienda Volta", pero se usa Voltio y no debe cambiar nunca).** Tienda online funcional ("**Tienda Voltio**") desplegada, con catálogo propio, que cualquiera pueda probar con la tarjeta 4242.
- Debe incluir: catálogo con búsqueda y filtros, carrito persistente, pago con Stripe confirmado por webhook, email con Resend y panel de pedidos.
- También: CI en verde y un README con la arquitectura.
- Fuera de alcance: cuentas de cliente, cupones, varias monedas, stock en tiempo real y envíos reales.

### Funcionales

**Páginas**
- `/`: catálogo con búsqueda por nombre, categoría y rango de precio.
- `/producto/[id]` (**decisión del usuario: se usa `/producto/[slug]`**, nunca el id): detalle con stock, selector de cantidad, 404 si no existe y título por producto.
- `/carrito`.
- `/checkout/exito` y `/checkout/cancelado`.
- `/admin`: lista de pedidos con filtro por estado y detalle.
- `/api/webhooks/stripe`.

**Modelo de datos**: Categoría, Producto, Pedido y LineaPedido. Estados del pedido: PENDIENTE, PAGADO, ENVIADO, ENTREGADO y CANCELADO.

**Datos de ejemplo**: seed idempotente con 4 categorías y 12 productos. Uno de ellos con stock 0 para probar "agotado".

**Filtros**: viven en la URL (`?q=&categoria=&min=&max=`) y se resuelven en el servidor con Prisma.

**Carrito**: Zustand con `persist` (localStorage), solo las líneas. El total y el número de artículos se calculan, no se guardan.

**Checkout**: una Server Action que valida lo que llega, relee precios y stock de la base, crea el pedido PENDIENTE y redirige a Stripe Checkout.

**Webhook**: verifica la firma; pasa el pedido a PAGADO, descuenta el stock y envía el email, todo **una sola vez**.

**Email**: confirmación de pedido con líneas y total. Si falla, el pedido sigue pagado.

**Éxito y cancelación**: la de éxito solo lee el pedido y vacía el carrito. La de cancelación conserva el carrito.

**Admin**: protegido con middleware y cookie httpOnly. Transiciones permitidas: PAGADO→ENVIADO→ENTREGADO y PENDIENTE→CANCELADO.

**Tests y CI**
- 5 tests de funciones puras con Vitest.
- Workflow de GitHub Actions con lint, tipos, tests y build en cada push, usando variables ficticias.

**Despliegue**: Vercel con deploy en cada push a `main` y un webhook de Stripe propio para producción, con su propio secreto.

### Reglas que no se negocian
1. Dinero siempre en céntimos (`Int`), nunca con decimales.
2. La clave secreta de Stripe va solo en el servidor (`server-only`, sin `NEXT_PUBLIC_`). Solo se aceptan claves `sk_test_`.
3. El pedido se confirma únicamente en el webhook, nunca en la página de éxito.
4. El navegador envía solo ids y cantidades. Los precios salen siempre de la base de datos.
5. Todo lo que llega por la URL se valida: ids, filtros y estados.
6. Cada Server Action comprueba quién llama y qué pide, además del middleware.
7. El `.env` nunca va al repositorio. `.env.example` sí, con la excepción `!.env.example` en el `.gitignore`.

### Convenciones
- Todo en español: textos de la web, comentarios y commits. **Excepción decidida por el usuario (2026-10-12): el código y la base de datos van siempre en inglés** (variables, funciones, tipos, clases, modelos, campos, enums, columnas). El curso nombra los modelos en español (Categoría, Producto, Pedido, LineaPedido, estados PENDIENTE…); en el código son `Category`, `Product`, `Order`, `OrderItem`, `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- Server Components por defecto; `"use client"` solo cuando hay estado o eventos.
- Una única instancia de Prisma (`src/lib/prisma.ts`) y una de Stripe (`src/lib/stripe.ts`).
- En Next 15, `params` y `searchParams` son Promises: hay que hacer `await`.
- `redirect()` va siempre fuera de cualquier `try/catch`.
- Un commit por paso.
- Fijar las versiones importantes y no usar `npm audit fix --force` a ciegas.
