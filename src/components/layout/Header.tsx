import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function Header({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="h-14 px-6 flex items-center border-b border-border-subtle bg-surface-raised">
      {showBack ? (
        <Link
          href="/buscador"
          className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Link>
      ) : (
        <Link href="/buscador" className="flex items-center gap-2">
          <span className="text-sm font-bold text-gold-600">MTC</span>
          <span className="text-sm text-text-tertiary">La Carolina</span>
        </Link>
      )}
    </header>
  );
}
