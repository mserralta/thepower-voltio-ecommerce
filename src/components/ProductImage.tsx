/** Placeholder hasta tener fotos reales (Product.imageUrl). */
export default function ProductImage({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center rounded-lg bg-surface text-line ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-1/4 w-1/4" fill="currentColor" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    </div>
  );
}
