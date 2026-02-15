export interface SiteConfig {
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    primaryDark: string;
  };
  footer: {
    text: string;
    links: FooterLink[];
  };
  socialLinks: {
    github?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  metadata: {
    title: string;
    description: string;
  };
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface SidebarItem {
  title: string;
  slug: string;
  url?: string;
  external?: boolean;
  children?: SidebarItem[];
}

export interface SidebarData {
  items: SidebarItem[];
}

export interface DocContent {
  content: string;
  slug: string;
  title: string;
  lastModified?: string;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface SearchEntry {
  title: string;
  slug: string;
  content: string;
  headings: string[];
  breadcrumb: string;
}

export interface SearchResult {
  title: string;
  slug: string;
  snippet: string;
  breadcrumb: string;
  matches?: ReadonlyArray<{
    key?: string;
    value?: string;
    indices?: ReadonlyArray<readonly [number, number]>;
  }>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface BreadcrumbItem {
  title: string;
  slug?: string;
}

export interface DocNavItem {
  title: string;
  slug: string;
}

export interface DocNavigation {
  prev: DocNavItem | null;
  next: DocNavItem | null;
}
