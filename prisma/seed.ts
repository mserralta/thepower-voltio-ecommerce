import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const categories = [
  { slug: "cables", name: "Cables y conductores", order: 1 },
  { slug: "iluminacion", name: "Iluminación inteligente", order: 2 },
  { slug: "automatizacion", name: "Automatización y actuadores", order: 3 },
  { slug: "proteccion", name: "Protección y mecanismos", order: 4 },
];

type SeedProduct = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  stock: number;
  description: string;
  specs: Record<string, string>;
};

// El producto con stock 0 (bombilla Wi-Fi Tapo) sirve para probar el estado "agotado".
const productData: Omit<SeedProduct, "slug">[] = [
  { sku: "CAB-H07VK-15-100", name: "Cable H07V-K 1,5 mm² · rollo 100 m", brand: "Top Cable", category: "cables", priceCents: 3495, stock: 40, description: "Cable unipolar flexible para instalaciones interiores en tubo. Ideal para circuitos de iluminación.", specs: { Sección: "1,5 mm²", Longitud: "100 m", Tensión: "450/750 V", Conductor: "Cobre clase 5", Color: "Azul" } },
  { sku: "CAB-H07VK-25-100", name: "Cable H07V-K 2,5 mm² · rollo 100 m", brand: "Top Cable", category: "cables", priceCents: 5290, stock: 32, description: "Cable unipolar flexible para circuitos de tomas de corriente de uso general.", specs: { Sección: "2,5 mm²", Longitud: "100 m", Tensión: "450/750 V", Conductor: "Cobre clase 5", Color: "Marrón" } },
  { sku: "CAB-CAT6-UTP-305", name: "Cable de red Cat6 U/UTP · bobina 305 m", brand: "Excel", category: "cables", priceCents: 11900, stock: 6, description: "Cable de datos para redes Gigabit. Cubierta LSZH libre de halógenos.", specs: { Categoría: "Cat6", Apantallamiento: "U/UTP", Longitud: "305 m", Cubierta: "LSZH", AWG: "23" } },
  { sku: "ILU-HUE-E27-W", name: "Bombilla White E27", brand: "Philips Hue", category: "iluminacion", priceCents: 1499, stock: 60, description: "Bombilla LED regulable con luz blanca cálida. Control por app, voz y Bluetooth.", specs: { Casquillo: "E27", Potencia: "9,5 W", Flujo: "806 lm", Temperatura: "2700 K", Protocolo: "Zigbee 3.0 / Bluetooth" } },
  { sku: "ILU-HUE-GU10-CA", name: "Bombilla White & Color GU10", brand: "Philips Hue", category: "iluminacion", priceCents: 4499, stock: 25, description: "Foco LED con 16 millones de colores y blancos regulables.", specs: { Casquillo: "GU10", Potencia: "5,7 W", Flujo: "350 lm", Temperatura: "2000–6500 K", Protocolo: "Zigbee 3.0 / Bluetooth" } },
  { sku: "ILU-TPL-L530E", name: "Bombilla Wi-Fi Color E27", brand: "TP-Link Tapo", category: "iluminacion", priceCents: 1290, stock: 0, description: "Bombilla Wi-Fi sin hub. Programación horaria y escenas desde la app.", specs: { Casquillo: "E27", Potencia: "8,7 W", Flujo: "806 lm", Temperatura: "2500–6500 K", Protocolo: "Wi-Fi 2,4 GHz / Matter" } },
  { sku: "AUT-SHELLY-1PM-G4", name: "Relé inteligente 1PM Gen4", brand: "Shelly", category: "automatizacion", priceCents: 2290, stock: 45, description: "Relé de 1 canal con medición de consumo. Se instala detrás del interruptor existente.", specs: { Canales: "1", Corriente: "16 A", Medición: "Sí", Protocolo: "Wi-Fi / Zigbee / Matter", Alimentación: "110–240 V AC" } },
  { sku: "AUT-SHELLY-2PM-CV", name: "Actuador de persiana 2PM", brand: "Shelly", category: "automatizacion", priceCents: 3290, stock: 20, description: "Controla persianas y toldos motorizados con calibración automática de recorrido.", specs: { Canales: "2 / modo persiana", Corriente: "2 × 10 A", Medición: "Sí", Protocolo: "Wi-Fi / Matter", Alimentación: "110–240 V AC" } },
  { sku: "AUT-HAG-CTR-25", name: "Contactor modular 25 A 2NA", brand: "Hager", category: "automatizacion", priceCents: 2650, stock: 15, description: "Contactor silencioso para carril DIN. Para termos, bombas y cargas de iluminación.", specs: { Corriente: "25 A", Contactos: "2 NA", Bobina: "230 V AC", Módulos: "1" } },
  { sku: "PRO-MAG-2P-16-C", name: "Magnetotérmico 2P 16 A curva C", brand: "Schneider Electric", category: "proteccion", priceCents: 1290, stock: 50, description: "Interruptor automático para protección de circuitos contra sobrecargas y cortocircuitos.", specs: { Polos: "1P+N", Calibre: "16 A", Curva: "C", "Poder de corte": "4,5 kA", Módulos: "2" } },
  { sku: "PRO-DIF-2P-40-30", name: "Diferencial 2P 40 A 30 mA clase A", brand: "Schneider Electric", category: "proteccion", priceCents: 4890, stock: 14, description: "Interruptor diferencial de alta sensibilidad. Clase A, recomendado para electrodomésticos y cargadores.", specs: { Polos: "2P", Calibre: "40 A", Sensibilidad: "30 mA", Clase: "A", Módulos: "2" } },
  { sku: "MEC-SIM82-ENCH", name: "Base de enchufe Schuko · Simon 82", brand: "Simon", category: "proteccion", priceCents: 690, stock: 120, description: "Base de enchufe con toma de tierra lateral y dispositivo de seguridad.", specs: { Tipo: "Schuko 2P+T", Corriente: "16 A", Tensión: "250 V", Serie: "Simon 82", Color: "Blanco" } },
];

/** "Cable H07V-K 1,5 mm² · rollo 100 m" → "cable-h07v-k-1-5-mm-rollo-100-m" */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
    categoryIds.set(c.slug, row.id);
  }

  const products: SeedProduct[] = productData.map((p) => ({ ...p, slug: slugify(p.name) }));

  for (const { category, ...p } of products) {
    const data = { ...p, categoryId: categoryIds.get(category)! };
    await prisma.product.upsert({ where: { sku: p.sku }, update: data, create: data });
  }

  console.log(`Seed: ${categories.length} categorías, ${products.length} productos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
