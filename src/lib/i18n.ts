import pt from "@/locales/pt";

type Locale = "pt" | "en";
type Dictionary = typeof pt;

const dictionaries: Record<string, Dictionary> = { pt };

function getLocale(): Locale {
  return (process.env.NEXT_PUBLIC_LOCALE as Locale) || "pt";
}

export function t(key: string): string {
  const locale = getLocale();
  const dict = dictionaries[locale] || dictionaries.pt;

  const keys = key.split(".");
  let value: unknown = dict;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
