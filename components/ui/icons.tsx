import { useId } from "react";

type IconProps = { className?: string };

export function SearchIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path d="M3 8h9.5M9 4.5L12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GitHubIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The app icon (app/icon.svg) as a component: a cap gauge beside a ledger. */
export function BrandMark({ className = "h-7 w-7" }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#1E1D22" stroke="#2E2D34" strokeWidth="1.5" />
      <rect x="14" y="10" width="16" height="44" rx="5" fill="#232228" stroke="#3A3941" strokeWidth="1.5" />
      <rect x="16.5" y="26" width="11" height="25.5" rx="3.5" fill={`url(#${id})`} />
      <line x1="10" y1="26" x2="34" y2="26" stroke="#B39BDF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="14" x2="54" y2="14" stroke="#A9A6B0" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="24" x2="54" y2="24" stroke="#A9A6B0" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="34" x2="50" y2="34" stroke="#3FA66A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="44" x2="54" y2="44" stroke="#A9A6B0" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="54" x2="46" y2="54" stroke="#D69A3C" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4B2A75" />
          <stop offset="1" stopColor="#8253C2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
