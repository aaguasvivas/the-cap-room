/** Strip accents and punctuation, lowercase, collapse spaces: "De'Andre Dončić" -> "deandre doncic". */
function fold(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics: Dončić → Doncic
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Join key between seeded rosters and nba.com stat rows: folded full name without a generational suffix. */
export function normalizeName(name: string): string {
  return fold(name).replace(/\s+(jr|sr|ii|iii|iv)$/i, "");
}

/** Search fold: like the join key but keeps suffixes, so "jr" and a half-typed "Porter J" still match. */
export function foldForSearch(text: string): string {
  return fold(text);
}
