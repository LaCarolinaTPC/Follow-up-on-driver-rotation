"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contrasena incorrectos"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard/conductores");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="MTC La Carolina"
            width={44}
            height={44}
            className="rounded-xl object-contain"
          />
          <div>
            <span className="text-xl font-bold text-white tracking-tight block">
              La Carolina
            </span>
            <span className="text-[11px] text-slate-500">
              Transporte con Corazon
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Seguimiento de
            <br />
            <span className="text-amber-400">Conductores</span>
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-md leading-relaxed">
            Plataforma de gestion y seguimiento a la rotacion del personal de
            conduccion.
          </p>
        </div>

        <p className="text-sm text-slate-700">
          &copy; {new Date().getFullYear()} Metropolitana de Transportes La
          Carolina S.A.S.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <Image
              src="/logo.png"
              alt="MTC La Carolina"
              width={80}
              height={80}
              className="rounded-2xl object-contain mb-4"
            />
            <span className="text-lg font-bold text-slate-900">
              La Carolina
            </span>
            <span className="text-xs text-slate-400">
              Transporte con Corazon
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 text-center lg:text-left">
            Iniciar sesion
          </h2>
          <p className="mt-2 text-sm text-slate-500 text-center lg:text-left">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
