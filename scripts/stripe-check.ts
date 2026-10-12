import { loadEnvConfig } from "@next/env";
import Stripe from "stripe";

loadEnvConfig(process.cwd());

const key = process.env.STRIPE_SECRET_KEY;
if (!key?.startsWith("sk_test_")) {
  console.error("STRIPE_SECRET_KEY falta o no empieza por sk_test_.");
  process.exit(1);
}

new Stripe(key).balance
  .retrieve()
  .then(() => console.log("Stripe OK (modo test)."))
  .catch((e) => {
    console.error("Fallo al hablar con Stripe:", e.message);
    process.exit(1);
  });
