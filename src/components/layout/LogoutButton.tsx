"use client";

import { LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export function LogoutButton() {
  const { collapsed } = useSidebar();

  return (
    <form action="/auth/signout" method="POST">
      <button
        type="submit"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full cursor-pointer"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span>Cerrar sesion</span>}
      </button>
    </form>
  );
}
