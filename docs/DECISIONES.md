# Decisiones tomadas de forma autónoma

Registro de las decisiones que se tomaron sin consultar al usuario (sesión autónoma del 2026-10-12). Cada una indica el motivo y cómo revertirla.

## Generales

1. **Repositorio git local, sin remoto.** El proyecto no era un repositorio; se hizo `git init` en `main` y un commit por paso (regla del curso). No se hace `push` ni se crea el repo en GitHub: eso queda en `docs/CONFIGURACION-MANUAL.md`.
2. **Sin shadcn/ui.** La UI actual es solo Tailwind con tokens de marca y funciona; adoptar shadcn (Base UI) a mitad de proyecto obliga a rehacer componentes y no aporta funcionalidad. Se mantienen componentes propios pequeños y accesibles. Si se quisiera, es un cambio puramente visual.
3. **Versiones fijadas sin `^`**: `zustand` 5.0.15, `resend` 6.32.1.
4. **`src/lib/stripe.ts` pasa a ser perezoso** (`getStripe()`), y lo mismo con Resend. Motivo: sin claves en el entorno, `next build` importaba el módulo y fallaba. Sigue habiendo una única instancia, `server-only` y la exigencia de `sk_test_`.

## Fase 3 — Carrito

5. El carrito guarda solo `{ productId, quantity }[]` en `localStorage` (clave `voltio-cart`). El total y el nº de artículos se calculan.
6. Los precios y el stock se piden al servidor con una Server Action de solo lectura (`getCartLines`) que valida los ids (formato cuid) y las cantidades. El navegador nunca pinta precios guardados.
7. Cálculo de subtotal/envío/total en `src/lib/pricing.ts` (puro, con tests), reutilizado por el checkout.
8. Cantidad máxima por línea: el stock, y como tope general 20 unidades.

## Fase 4 — Checkout

9. **Checkout alojado de Stripe** con `price_data` en EUR y una línea extra "Envío" cuando corresponde (en vez de `shipping_options`), para que el total de Stripe coincida con el del pedido en base de datos al céntimo.
10. **Pedidos PENDING abandonados**: la sesión de Stripe caduca (30 min, mínimo permitido) y el webhook `checkout.session.expired` pasa el pedido a `CANCELLED`.
11. **Idempotencia**: se inserta el `StripeEvent` dentro de la misma transacción que el cambio de estado; si la inserción falla por clave duplicada, el evento ya se procesó y se responde 200.
12. **Stock insuficiente al confirmar el pago**: el pago ya se cobró, así que el pedido pasa a `PAID`, el stock no baja de 0 y se marca `stockIssue = true`.
13. **Email**: se envía tras la transacción; si falla, se registra el error y el pedido sigue `PAID`. Sin `RESEND_API_KEY` se omite con un aviso en el log. Para no reenviar en reintentos, el envío cuelga del primer procesamiento del evento (el evento duplicado responde 200 antes).
14. **Remitente del email**: `onboarding@resend.dev` (dominio de pruebas de Resend) y destinatario `EMAIL_PRUEBAS`, porque sin dominio verificado Resend solo entrega a la cuenta propietaria.
15. **Página de éxito**: lee el pedido por `session_id` (validado con regex `cs_…`) y nunca marca nada como pagado. Vacía el carrito desde un componente cliente solo si el pedido existe.

## Fase 5 — Admin

16. **Autenticación**: contraseña única `ADMIN_PASSWORD`; la cookie `admin_session` (httpOnly, sameSite lax, secure en producción) contiene un HMAC-SHA256 de una cadena fija con la contraseña como clave, no la contraseña. El middleware (Edge, Web Crypto) y cada Server Action verifican esa cookie. Comparación en tiempo constante.
17. Rutas: `/admin` (lista + filtro `?estado=`), `/admin/pedidos/[id]` (detalle), `/admin/login`.
18. Las transiciones se validan en una función pura con tests (`src/lib/order-status.ts`).
19. El login del admin no limita intentos (proyecto de curso, contraseña única); mitigación: contraseña larga. Ampliable con un contador en base de datos o el firewall de Vercel.
20. Cancelar un pedido `PENDING` desde admin no toca Stripe (la sesión caducará sola).

## Fase 6 — Cierre

21. README con arquitectura sustituye al de `create-next-app`.
22. El workflow de CI ya existía; se amplía solo si hace falta.
23. Despliegue en Vercel y webhook de producción: pasos manuales en `docs/CONFIGURACION-MANUAL.md` (no se pueden hacer sin cuentas).
24. `DATABASE_URL_POOLED` del `.env` local no se usa; se documenta cómo unificarlo.

## Limitaciones de verificación

Sin claves de Stripe ni Resend en el `.env` no se pudo probar el pago real ni el email. Verificado: lint, tipos, 17 tests, build; el webhook con eventos firmados (`generateTestHeaderString`) contra la base real: sin firma/firma mala → 400, primera entrega → PAID + stock descontado + dirección guardada, entrega duplicada → 200 sin efecto; el admin con curl (redirección sin cookie, acceso con cookie válida, cookie falsa rechazada). Sin probar: `createCheckout` contra Stripe, el email real y el login desde el navegador. Ver `docs/CONFIGURACION-MANUAL.md` para la prueba completa.
