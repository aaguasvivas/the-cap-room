"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/cap",
    label: "Cap Sheet",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M3 13V6M8 13V3M13 13V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/trade",
    label: "Trade Machine",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M11 2l3 3-3 3M14 5H5M5 8l-3 3 3 3M2 11h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/players",
    label: "Player Eval",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <circle cx="8" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2.8 13.4c.9-2.6 2.8-3.9 5.2-3.9s4.3 1.3 5.2 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function NavRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Modules" className="flex md:flex-col gap-1 md:gap-1.5">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-royal text-bone"
                : "text-silver hover:bg-graphite-panel hover:text-bone"
            }`}
          >
            {item.icon}
            <span className="font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
