export interface SeoCountryDefinition {
  code: string;
  slug: string;
  name: string;
}

export const SEO_COUNTRIES: SeoCountryDefinition[] = [
  { code: "US", slug: "us", name: "United States" },
  { code: "UK", slug: "uk", name: "United Kingdom" },
  { code: "DE", slug: "germany", name: "Germany" },
  { code: "FR", slug: "france", name: "France" },
  { code: "NL", slug: "netherlands", name: "Netherlands" },
  { code: "IE", slug: "ireland", name: "Ireland" },
  { code: "ES", slug: "spain", name: "Spain" },
  { code: "IT", slug: "italy", name: "Italy" },
  { code: "SE", slug: "sweden", name: "Sweden" },
  { code: "CH", slug: "switzerland", name: "Switzerland" },
  { code: "NO", slug: "norway", name: "Norway" },
  { code: "DK", slug: "denmark", name: "Denmark" },
  { code: "FI", slug: "finland", name: "Finland" },
  { code: "AT", slug: "austria", name: "Austria" },
  { code: "BE", slug: "belgium", name: "Belgium" },
  { code: "PT", slug: "portugal", name: "Portugal" },
  { code: "PL", slug: "poland", name: "Poland" },
  { code: "CZ", slug: "czech-republic", name: "Czech Republic" },
  { code: "HU", slug: "hungary", name: "Hungary" },
  { code: "RO", slug: "romania", name: "Romania" },
  { code: "GR", slug: "greece", name: "Greece" },
  { code: "IN", slug: "india", name: "India" },
];

export const FEATURED_COMBO_COUNTRY_CODES = ["US", "UK", "DE", "FR", "NL", "IE", "ES", "IT"] as const;

export function getSeoCountryByCode(code: string): SeoCountryDefinition | undefined {
  return SEO_COUNTRIES.find((country) => country.code === String(code || "").trim().toUpperCase());
}

export function getSeoCountryBySlug(slug: string): SeoCountryDefinition | undefined {
  return SEO_COUNTRIES.find((country) => country.slug === String(slug || "").trim().toLowerCase());
}

export function getFeaturedComboCountries(): SeoCountryDefinition[] {
  return FEATURED_COMBO_COUNTRY_CODES
    .map((code) => getSeoCountryByCode(code))
    .filter((value): value is SeoCountryDefinition => Boolean(value));
}
