export function resolvePortfolioTokenSymbol(
  enrichedSymbol?: string | null,
  embeddedSymbol?: string | null,
): string | undefined {
  return normalizeSymbol(enrichedSymbol) ?? normalizeSymbol(embeddedSymbol);
}

function normalizeSymbol(symbol?: string | null): string | undefined {
  const normalized = symbol?.trim();
  return normalized || undefined;
}
