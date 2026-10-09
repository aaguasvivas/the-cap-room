"use client";

/**
 * Starts a page's own API requests during HTML parse on a hard load, so the
 * data is already in flight when the client component hydrates and fetches.
 *
 * Two details make this work:
 * - It is a client component on purpose. A <link rel="preload"> rendered by a
 *   server component also travels as a resource hint in the RSC payload, so
 *   merely prefetching a route (every visible nav link does) fired that
 *   route's API calls on whatever page the visitor was reading.
 * - crossOrigin="anonymous" matches fetch()'s default same-origin credentials
 *   mode; without it the browser discards the preloaded response and the
 *   request runs twice.
 */
export function PreloadApi({ hrefs }: { hrefs: string[] }) {
  return (
    <>
      {hrefs.map((href) => (
        <link key={href} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </>
  );
}
