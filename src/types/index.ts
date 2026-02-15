// === Site Config ===

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
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  metadata: {
    title: string;
    description: string;
  };
  hero?: HeroConfig;
  navbar?: NavbarConfig;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  background: "color" | "image";
  backgroundColor: string;
  backgroundImage: string;
  textColor: string;
}

export interface NavbarLink {
  label: string;
  url: string;
}

export interface NavbarCta {
  label: string;
  url: string;
  style: "primary" | "outline";
}

export interface NavbarConfig {
  links: NavbarLink[];
  cta: NavbarCta[];
}

// === Categories ===

export interface Category {
  id: string;
  title: string;
  description: string;
  slug: string;
  icon: string;
  iconBgColor: string;
  order: number;
  parentId?: string | null;
}

export interface CategoryWithCount extends Category {
  articleCount: number;
}

export interface CategoriesData {
  categories: Category[];
}

// === Articles ===

export type ArticleStatus = "published" | "draft";

export interface ArticleMeta {
  title: string;
  slug: string;
  category: string | null;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  order: number;
}

// === Content ===

export interface Heading {
  id: string;
  text: string;
  level: number;
}

// === Search ===

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

// === UI ===

export interface BreadcrumbItem {
  title: string;
  slug?: string;
  url?: string;
}

export interface DocNavItem {
  title: string;
  slug: string;
}

export interface DocNavigation {
  prev: DocNavItem | null;
  next: DocNavItem | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// === Manifest ===

export interface Manifest {
  articles: ArticleMeta[];
  updatedAt: string;
}
