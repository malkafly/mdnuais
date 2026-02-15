import { ArticleMeta, Manifest } from "@/types";
import { getObject, putObject, listObjects } from "./storage";

const MANIFEST_PATH = "manifest.json";

export async function getManifest(): Promise<ArticleMeta[]> {
  const raw = await getObject(MANIFEST_PATH);
  if (raw) {
    try {
      const data = JSON.parse(raw) as Manifest;
      return data.articles;
    } catch {
      /* malformed manifest, rebuild */
    }
  }
  return rebuildManifest();
}

export async function rebuildManifest(): Promise<ArticleMeta[]> {
  const keys = await listObjects("docs/");
  const jsonKeys = keys.filter((k) => k.endsWith(".json"));

  const results = await Promise.all(
    jsonKeys.map(async (key) => {
      const raw = await getObject(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as ArticleMeta;
      } catch {
        return null;
      }
    })
  );

  const articles = results.filter(Boolean) as ArticleMeta[];
  articles.sort((a, b) => a.order - b.order);

  await putObject(
    MANIFEST_PATH,
    JSON.stringify({ articles, updatedAt: new Date().toISOString() } as Manifest, null, 2),
    "application/json"
  );

  return articles;
}

export async function updateManifestEntry(slug: string, meta: ArticleMeta): Promise<void> {
  const articles = await getManifest();
  const index = articles.findIndex((a) => a.slug === slug);
  if (index >= 0) {
    articles[index] = meta;
  } else {
    articles.push(meta);
  }
  articles.sort((a, b) => a.order - b.order);

  await putObject(
    MANIFEST_PATH,
    JSON.stringify({ articles, updatedAt: new Date().toISOString() } as Manifest, null, 2),
    "application/json"
  );
}

export async function removeManifestEntry(slug: string): Promise<void> {
  const articles = await getManifest();
  const filtered = articles.filter((a) => a.slug !== slug);

  await putObject(
    MANIFEST_PATH,
    JSON.stringify({ articles: filtered, updatedAt: new Date().toISOString() } as Manifest, null, 2),
    "application/json"
  );
}
