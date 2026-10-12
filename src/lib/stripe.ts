import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Falta STRIPE_SECRET_KEY en .env");
// Regla del curso: solo claves de test.
if (!key.startsWith("sk_test_")) throw new Error("STRIPE_SECRET_KEY debe empezar por sk_test_");

export const stripe = new Stripe(key);
