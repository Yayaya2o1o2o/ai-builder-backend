import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--canvas) 85%, transparent)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <span aria-hidden>🕉️</span>
          Svaram
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/browse" className="opacity-70 transition-opacity hover:opacity-100">
            Browse
          </Link>
          <Link href="/search" className="rounded-full px-4 py-2 font-medium text-white" style={{ background: "var(--maroon)" }}>
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
