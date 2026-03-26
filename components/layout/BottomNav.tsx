"use client";

import { usePathname, useRouter } from "next/navigation";

export function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const tabs = [
    { name: "Home", path: "/home", icon: "🏠" },
    { name: "Water", path: "/water", icon: "💧" },
    { name: "Cycle", path: "/cycle", icon: "🌙" },
    { name: "Messages", path: "/messages", icon: "💌" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t shadow-lg">
      <div className="flex justify-around items-center py-2">

        {tabs.map((tab) => {
          const active = path === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center text-xs transition ${
                active ? "text-pink-500" : "text-gray-500"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.name}
            </button>
          );
        })}

      </div>
    </div>
  );
}