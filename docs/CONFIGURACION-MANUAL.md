# Configuración manual pendiente

Todo lo que no se puede hacer desde el código y necesita tus cuentas. Hazlo en este orden. Los secretos van en `.env` (local) y en las variables de entorno de Vercel (producción); **nunca** se suben al repositorio.

## 0. Variables de entorno (resumen)

| Variable | De dónde sale |
|---|---|
| `DATABASE_URL` | Neon → Connection string **con pooler** |
| `DIRECT_URL` | Neon → Connection string **directa** (sin pooler); la usan las migraciones |
| `STRIPE_SECRET_KEY` | Stripe (test) → Developers → API keys → Secret key `sk_test_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Misma pantalla → Publishable key `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (apartado 2 en local, apartado 5 en producción) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` en local; la URL de Vercel en producción |
| `RESEND_API_KEY` | Resend → API Keys |
| `EMAIL_PRUEBAS` | Tu email (el de tu cuenta de Resend) |
| `ADMIN_PASSWORD` | Una contraseña larga que elijas |

En el `.env` actual hay `DATABASE_URL_POOLED`, que el código no usa: pon su valor en `DATABASE_URL` y añade `DIRECT_URL` (conexión directa).

## 1. Stripe (modo test)

1. Crea/entra en tu cuenta de Stripe y asegúrate de estar en **modo test / Sandbox**.
2. Copia `sk_test_…` y `pk_test_…` al `.env`.
3. Comprueba: `npm run stripe:check` debe decir "Stripe OK (modo test)".
4. Ajustes de Checkout: no hace falta activar nada más (la tarjeta está activa por defecto). Idioma y país de envío (solo ES) se fijan en el código.

## 2. Stripe CLI (webhook en local)

1. Instala la Stripe CLI y haz `stripe login`.
2. En una terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. Copia el `whsec_…` que muestra a `STRIPE_WEBHOOK_SECRET` en `.env` y reinicia `npm run dev`.
4. Prueba un pedido completo: añade productos, paga con `4242 4242 4242 4242` y comprueba que `/checkout/exito` pasa a "Pago confirmado" y que el pedido aparece como Pagado en `/admin`.

## 3. Resend

1. Crea cuenta y una API key → `RESEND_API_KEY`.
2. `EMAIL_PRUEBAS` = el email con el que te registraste. Sin dominio verificado, Resend solo entrega a ese email, y el remitente es `onboarding@resend.dev`.
3. (Opcional, para enviar a clientes reales) Verifica un dominio en Resend, cambia `from` en `src/lib/email.ts` y deja `EMAIL_PRUEBAS` vacío.

## 4. GitHub y Vercel

1. Crea el repositorio en GitHub y súbelo: `git remote add origin <url>` y `git push -u origin main` (el repo local ya tiene un commit por fase).
2. Comprueba que el workflow **CI** sale en verde (usa variables ficticias, no necesita secretos).
3. En Vercel: *Add New → Project* → importa el repo (framework Next.js, plan Hobby).
4. En *Settings → Environment Variables* añade todas las de la tabla del apartado 0. En producción `NEXT_PUBLIC_SITE_URL` es la URL final de Vercel (pon primero un valor provisional, haz el primer deploy y corrígela). `DATABASE_URL` con pooler.
5. Haz *Redeploy* tras cambiar variables. Cada push a `main` despliega solo.
6. Migraciones en producción: la base de Neon es la misma que usas en local; si algún día usas otra, ejecuta `npm run db:deploy` con su `DIRECT_URL` y `npm run seed`.

## 5. Webhook de producción en Stripe

1. Stripe → Developers → Webhooks → *Add endpoint*.
2. URL: `https://<tu-dominio-vercel>/api/webhooks/stripe`.
3. Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded` y `checkout.session.expired`.
4. Copia su *Signing secret* (`whsec_…`, **distinto** al de la CLI) a `STRIPE_WEBHOOK_SECRET` en Vercel y haz *Redeploy*.
5. Prueba una compra en la web desplegada y mira *Webhooks → Recent deliveries* (debe responder 200).

## 6. Revisión final

- `npm audit` avisa de vulnerabilidades sin revisar: míralas, pero no uses `npm audit fix --force` a ciegas.
- Cambia `ADMIN_PASSWORD` por una contraseña fuerte en Vercel.
- El panel no limita intentos de contraseña (ver `docs/DECISIONES.md`); no la reutilices.
