"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BarChart3,
  FileSpreadsheet,
  Bus,
  PanelLeftClose,
  Menu,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { label: "Conductores", href: "/dashboard/conductores", icon: Users },
  { label: "Rendimiento", href: "/dashboard/rendimiento", icon: BarChart3 },
  { label: "Datos", href: "/dashboard/datos", icon: FileSpreadsheet },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const { collapsed, mobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 text-amber-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-[15px] font-bold text-white tracking-tight truncate">
                MTC La Carolina
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                Seguimiento Conductores
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <p className={`text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3 ${collapsed ? "text-center" : "px-3"}`}>
            {collapsed ? "—" : "Menu"}
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/5"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800/80 p-3 space-y-1">
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors w-full cursor-pointer"
          >
            <PanelLeftClose
              className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && <span>Colapsar</span>}
          </button>
          <LogoutButton />
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-700">
              <span className="text-[11px] font-bold text-slate-300">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "??"}
              </span>
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-semibold text-slate-300 truncate">
                  {userEmail || "Usuario"}
                </span>
                <span className="text-[11px] text-slate-600 truncate">
                  MTC La Carolina
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileTopBar() {
  const { toggleMobile } = useSidebar();

  return (
    <div className="lg:hidden h-14 flex items-center px-4 border-b border-border bg-surface-raised sticky top-0 z-20">
      <button
        onClick={toggleMobile}
        className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-slate-100 cursor-pointer transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="ml-3 flex items-center gap-2">
        <Bus className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold text-text-primary">MTC La Carolina</span>
      </div>
    </div>
  );
}

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ease-in-out ${
        collapsed ? "lg:ml-[68px]" : "lg:ml-[260px]"
      }`}
    >
      <MobileTopBar />
      <main className="p-6">{children}</main>
    </div>
  );
}
