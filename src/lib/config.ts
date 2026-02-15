import { SiteConfig, HeroConfig, NavbarConfig } from "@/types";
import { getObject, putObject } from "./storage";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";

const CONFIG_KEY = "config";

const defaultHero: HeroConfig = {
  title: "Como podemos ajudar?",
  subtitle: "Busque na nossa base de conhecimento",
  background: "color",
  backgroundColor: "#4F46E5",
  backgroundImage: "",
  textColor: "#FFFFFF",
};

const defaultNavbar: NavbarConfig = {
  links: [],
  cta: [],
};

const defaultConfig: SiteConfig = {
  name: "mdnuais",
  logo: "",
  favicon: "",
  colors: {
    primary: "#2563eb",
    primaryDark: "#60a5fa",
  },
  footer: {
    text: "",
    links: [],
  },
  socialLinks: {},
  metadata: {
    title: "mdnuais",
    description: "Base de conhecimento",
  },
  hero: defaultHero,
  navbar: defaultNavbar,
};

export async function getConfig(): Promise<SiteConfig> {
  const cached = cacheGet<SiteConfig>(CONFIG_KEY);
  if (cached) return cached;

  const raw = await getObject("config.json");
  if (!raw) {
    cacheSet(CONFIG_KEY, defaultConfig);
    return defaultConfig;
  }

  const stored = JSON.parse(raw) as Partial<SiteConfig>;
  const config: SiteConfig = {
    ...defaultConfig,
    ...stored,
    colors: { ...defaultConfig.colors, ...(stored.colors || {}) },
    footer: { ...defaultConfig.footer, ...(stored.footer || {}) },
    socialLinks: { ...defaultConfig.socialLinks, ...(stored.socialLinks || {}) },
    metadata: { ...defaultConfig.metadata, ...(stored.metadata || {}) },
    hero: { ...defaultHero, ...(stored.hero || {}) },
    navbar: { ...defaultNavbar, ...(stored.navbar || {}) },
  };

  cacheSet(CONFIG_KEY, config);
  return config;
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  await putObject("config.json", JSON.stringify(config, null, 2), "application/json");
  cacheInvalidate(CONFIG_KEY);
}
