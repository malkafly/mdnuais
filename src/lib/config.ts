import { SiteConfig, SidebarData } from "@/types";
import { getObject, putObject } from "./storage";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";

const CONFIG_KEY = "config";
const SIDEBAR_KEY = "sidebar";

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
};

const defaultSidebar: SidebarData = {
  items: [],
};

export async function getConfig(): Promise<SiteConfig> {
  const cached = cacheGet<SiteConfig>(CONFIG_KEY);
  if (cached) return cached;

  const raw = await getObject("config.json");
  if (!raw) {
    cacheSet(CONFIG_KEY, defaultConfig);
    return defaultConfig;
  }

  const config = JSON.parse(raw) as SiteConfig;
  cacheSet(CONFIG_KEY, config);
  return config;
}

export async function saveConfig(config: SiteConfig): Promise<void> {
  await putObject("config.json", JSON.stringify(config, null, 2), "application/json");
  cacheInvalidate(CONFIG_KEY);
}

export async function getSidebar(): Promise<SidebarData> {
  const cached = cacheGet<SidebarData>(SIDEBAR_KEY);
  if (cached) return cached;

  const raw = await getObject("sidebar.json");
  if (!raw) {
    cacheSet(SIDEBAR_KEY, defaultSidebar);
    return defaultSidebar;
  }

  const sidebar = JSON.parse(raw) as SidebarData;
  cacheSet(SIDEBAR_KEY, sidebar);
  return sidebar;
}

export async function saveSidebar(sidebar: SidebarData): Promise<void> {
  await putObject("sidebar.json", JSON.stringify(sidebar, null, 2), "application/json");
  cacheInvalidate(SIDEBAR_KEY);
}
