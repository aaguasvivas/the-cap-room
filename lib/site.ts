/** Who built this and where its source lives: one place, used by the shell, home and metadata. */
export const SITE = {
  name: "The Cap Room",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-cap-room.vercel.app",
  author: "Adelson Aguasvivas",
  authorUrl: "https://adelsonaguasvivas.com",
  repoUrl: "https://github.com/aaguasvivas/the-cap-room",
} as const;

/** Deep link to a file or folder in the public repo. */
export const sourceUrl = (path: string): string =>
  `${SITE.repoUrl}/${path.endsWith("/") ? "tree" : "blob"}/main/${path.replace(/\/$/, "")}`;
