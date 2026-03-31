import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "MTC La Carolina — Seguimiento Conductores",
  description:
    "Aplicacion de seguimiento a la rotacion de conductores de MTC La Carolina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-bg`}>
        {children}
      </body>
    </html>
  );
}
