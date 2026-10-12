import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/** Única instancia de Stripe. Es perezosa para que `next build` no exija la clave. */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY en .env");
  // Regla del curso: solo claves de test.
  if (!key.startsWith("sk_test_")) throw new Error("STRIPE_SECRET_KEY debe empezar por sk_test_");
  client = new Stripe(key);
  return client;
}
