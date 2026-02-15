import { SidebarItem, DocNavigation, BreadcrumbItem, DocNavItem } from "@/types";

function flattenItems(items: SidebarItem[]): DocNavItem[] {
  const flat: DocNavItem[] = [];
  for (const item of items) {
    if (item.external) continue;
    if (item.children && item.children.length > 0) {
      flat.push(...flattenItems(item.children));
    } else {
      flat.push({ title: item.title, slug: item.slug });
    }
  }
  return flat;
}

export function getDocNavigation(
  items: SidebarItem[],
  currentSlug: string
): DocNavigation {
  const flat = flattenItems(items);
  const index = flat.findIndex((item) => item.slug === currentSlug);

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}

export function getBreadcrumbs(
  items: SidebarItem[],
  currentSlug: string
): BreadcrumbItem[] {
  const path: BreadcrumbItem[] = [];
  findBreadcrumbPath(items, currentSlug, path);
  return path;
}

function findBreadcrumbPath(
  items: SidebarItem[],
  slug: string,
  path: BreadcrumbItem[]
): boolean {
  for (const item of items) {
    if (item.slug === slug && !item.children) {
      path.push({ title: item.title });
      return true;
    }
    if (item.children) {
      path.push({ title: item.title, slug: item.slug });
      if (findBreadcrumbPath(item.children, slug, path)) {
        return true;
      }
      path.pop();
    }
  }
  return false;
}

export function getFirstDocSlug(items: SidebarItem[]): string | null {
  for (const item of items) {
    if (item.external) continue;
    if (item.children && item.children.length > 0) {
      const slug = getFirstDocSlug(item.children);
      if (slug) return slug;
    } else {
      return item.slug;
    }
  }
  return null;
}
