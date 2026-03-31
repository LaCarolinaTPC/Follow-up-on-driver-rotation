"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils/format";
import { GrupoBadge, TipoBadge } from "@/components/ui/Badge";

interface SearchResult {
  cedula: string;
  nombre: string;
  codigo: string | null;
  tipo_conductor: string | null;
  estado: string;
  grupo_antiguedad: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/conductores/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setShowResults(true);
        setSelectedIdx(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre o cedula..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-14 px-5 pl-12 text-base bg-surface-raised rounded-2xl border-2 border-transparent shadow-[0_2px_8px_0_rgba(0,0,0,0.06)] focus:border-gold-400 focus:ring-4 focus:ring-gold-50 focus:outline-none placeholder:text-text-muted transition-all duration-200"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400 animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-raised rounded-2xl border border-border-subtle shadow-[0_8px_24px_0_rgba(0,0,0,0.08)] max-h-[400px] overflow-y-auto z-20">
          {results.length === 0 && !loading && (
            <div className="py-12 text-center">
              <p className="text-sm text-text-tertiary">
                No se encontraron resultados
              </p>
              <p className="text-xs text-text-muted mt-1">
                Intenta con otro nombre o cedula
              </p>
            </div>
          )}
          {loading && results.length === 0 && (
            <div className="p-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-border rounded-full w-3/5" />
                    <div className="h-3 bg-border-subtle rounded-full w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {results.map((r, i) => (
            <Link
              key={r.cedula}
              href={`/conductor/${r.cedula}`}
              className={`flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 transition-colors duration-150 cursor-pointer ${
                i === selectedIdx
                  ? "bg-gold-50/60"
                  : "hover:bg-gold-50/40"
              } ${r.estado === "RETIRADO" ? "opacity-40" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-text-primary text-gold-400 flex items-center justify-center text-sm font-semibold shrink-0">
                {getInitials(r.nombre)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">
                  {r.nombre}
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">
                  CC {r.cedula}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <TipoBadge tipo={r.tipo_conductor} />
                <GrupoBadge grupo={r.grupo_antiguedad} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!showResults && !loading && !query && (
        <div className="mt-20 text-center animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center mb-6">
            <Search className="w-7 h-7 text-gold-400" />
          </div>
          <p className="text-sm text-text-tertiary max-w-sm mx-auto leading-relaxed">
            Escribe el nombre o numero de cedula para ver toda la informacion
            del conductor: datos personales, rendimiento, accidentes, ausentismo
            y mas.
          </p>
          <p className="mt-4 text-xs text-text-muted">
            Minimo 2 caracteres para buscar
          </p>
        </div>
      )}
    </div>
  );
}
