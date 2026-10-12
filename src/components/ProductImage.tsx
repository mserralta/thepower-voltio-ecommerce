import { pictogramFor, type PictogramKey } from "@/lib/pictograms";

// Pictogramas propios (viewBox 24×24, trazo de 1,5). Se dibujan con `currentColor`.
const PATHS: Record<PictogramKey, React.ReactNode> = {
  "cable-reel": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M17.5 12v6h3.5" />
    </>
  ),
  "network-cable": (
    <>
      <path d="M5 8h14v10H5zM9 8V5h6v3" />
      <path d="M8 18v-4M10.7 18v-4M13.3 18v-4M16 18v-4" />
      <path d="M12 18v3" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 17v-1.5C7 14.3 6 12.6 6 10.5a6 6 0 0 1 12 0c0 2.1-1 3.8-3 5V17z" />
      <path d="M9.5 20h5M10.5 22h3" />
    </>
  ),
  spot: (
    <>
      <path d="M5 4h14l-2.5 11h-9z" />
      <path d="M9.5 15v3M14.5 15v3" />
      <path d="M8.5 18h2M13.5 18h2" />
    </>
  ),
  "smart-bulb": (
    <>
      <path d="M9 19v-1.500C7.5 16.6 6.5 15.3 6.5 13.5a5.5 5.5 0 0 1 11 0c0 1.8-1 3.1-2.5 4V19z" />
      <path d="M10 22h4" />
      <path d="M8.5 4.5a5 5 0 0 1 7 0M10.2 6.2a2.6 2.6 0 0 1 3.6 0" />
    </>
  ),
  relay: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 12h2.500l3-3M13.5 12H16" />
      <circle cx="10.5" cy="12" r="0.8" />
      <circle cx="14" cy="12" r="0.8" />
    </>
  ),
  "blind-actuator": (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M4 7h16M4 10.500h16M4 14h16" />
      <path d="M12 21v-4M10 19l2 2 2-2" />
    </>
  ),
  contactor: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M9 15h6M9 18h6" />
      <path d="M12 6.500V3" />
    </>
  ),
  breaker: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="1.5" />
      <rect x="10" y="7" width="4" height="6" rx="0.8" />
      <path d="M12 7V4.500M9.5 17h5" />
    </>
  ),
  rcd: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <rect x="8" y="6" width="3.5" height="5" rx="0.8" />
      <circle cx="15" cy="8.5" r="1.8" />
      <path d="M8 15h8M8 18h8" />
    </>
  ),
  socket: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="9.8" cy="12" r="0.9" />
      <circle cx="14.2" cy="12" r="0.9" />
      <path d="M12 6v1.500M12 16.500V18" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
};

type Props = { name: string; sku?: string; className?: string };

/** Pictograma SVG del producto (hasta tener fotos reales en `Product.imageUrl`). */
export default function ProductImage({ name, sku, className = "" }: Props) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-lg bg-surface text-brand ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-1/2 w-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {PATHS[sku ? pictogramFor(sku) : "bolt"]}
      </svg>
    </div>
  );
}
