"use client";

import { useEffect, useState } from "react";
import { AdminBottomNav, AdminMobileHeader, AdminSidebar } from "@/components/admin/AdminSidebar";

const STORAGE_KEY = "rdc-admin-sidebar-collapsed";

type Props = {
  children: React.ReactNode;
};

function readCollapsedFromStorage(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AdminShellClient({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCollapsed(readCollapsedFromStorage());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const sidebarWidth = collapsed ? "4.5rem" : "16rem";

  return (
    <div
      className="flex min-h-screen text-white"
      style={
        {
          "--admin-sidebar-width": sidebarWidth,
        } as React.CSSProperties
      }
    >
      <aside
        className={`hidden shrink-0 border-r border-[#1f1f1f] bg-[#0a0a0a] transition-[width] duration-200 ease-out md:block ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
          <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
        </div>
      </aside>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminMobileHeader />
        <main className="flex-1 px-3 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-4 md:px-8 md:py-10 md:pb-10">
          {children}
        </main>
        <AdminBottomNav />
      </div>
    </div>
  );
}
