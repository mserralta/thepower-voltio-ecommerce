# Progreso — dónde lo dejamos

Última sesión: 2026-10-26. **Todas las fases de código están hechas.** Queda la configuración manual en cuentas externas: ver `docs/CONFIGURACION-MANUAL.md`.

Lee primero `CLAUDE.md` (stack y convenciones), `docs/SPEC.md` (qué se construye), `docs/REQUISITOS.md` (curso) y `docs/DECISIONES.md` (decisiones tomadas sin consultar).

## Cómo arrancar

```bash
npm install
npm run dev          # http://localhost:3000
```

`.env` necesita las variables de `.env.example` (ver `docs/CONFIGURACION-MANUAL.md`). No lances `npm run build` con `npm run dev` en marcha.

## Estado por fases

| Fase | Estado |
|---|---|
| 1. Esqueleto | ✅ |
| 2. Base de datos y catálogo | ✅ |
| 3. Carrito (Zustand + persist, `/carrito`) | ✅ |
| 4. Checkout Stripe + webhook + email Resend + éxito/cancelado | ✅ código; sin probar contra Stripe/Resend reales (faltan claves) |
| 5. Admin (middleware + cookie, pedidos, transiciones) | ✅ |
| 7. Admin ampliado: edición de productos + navegación | ✅ |
| 6. Cierre: README | ✅ · Vercel, GitHub y webhook de producción: manual |
| 8. Compra rápida en el catálogo (stepper − / input / +, visible al pasar el cursor) + avisos de stock/tope de 20 en catálogo y ficha | ✅ (commit `38e945c`) |

## Siguiente paso

1. Rellenar claves y hacer la prueba completa de pago (`docs/CONFIGURACION-MANUAL.md`, apartados 1–3).
2. Subir a GitHub, comprobar CI en verde, desplegar en Vercel y crear el webhook de producción (apartados 4–5).
3. Si algo falla en la prueba real, el punto de entrada es `src/app/carrito/checkout-action.ts` (sesión) o `src/lib/fulfillment.ts` (webhook).

## Verificado

`npm run lint`, `npm run typecheck`, `npm test` (21 tests) y `npm run build` OK. Webhook probado con eventos firmados contra la base real (firma, idempotencia, stock). Admin probado con curl. Detalles y lo no probado: final de `docs/DECISIONES.md`.

## Pendiente / ideas sueltas

- Fotos de producto (`imageUrl`): decidir alojamiento y `images.remotePatterns`.
- `createdAt` es igual en todo el seed.
- `npm audit` avisa de vulnerabilidades sin revisar (no usar `--force` a ciegas).
- Tope de 20 unidades por línea (`MAX_QUANTITY`): se mantiene y se avisa al cliente; si se quiere que el tope sea solo el stock, hay que quitarlo de `pricing.ts`, `cart-store.ts`, `cart-input.ts`, el test y la SPEC.
- Un pedido `PENDING` abandonado se cancela solo a los 30 min por el evento `checkout.session.expired` (requiere el webhook configurado).
- El login del admin no limita intentos.
