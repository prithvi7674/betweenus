"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/water", label: "Water", icon: "💧" },
  { href: "/cycle", label: "Cycle", icon: "🌙" },
  { href: "/messages", label: "Messages", icon: "💌" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-[9999] flex w-[90%] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/30 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-xl"
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-all duration-200 ${isActive ? "scale-110 text-pink-500" : "text-gray-400"}`}
          >
            <span
              className={`flex flex-col items-center justify-center gap-1 rounded-full px-3 py-1 ${
                isActive ? "bg-pink-100" : ""
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {item.icon}
              </span>
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
