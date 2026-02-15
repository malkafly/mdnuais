import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { getCategories, saveCategories } from "@/lib/categories";
import {
  saveArticleMeta,
  saveArticleContent,
  listAllArticles,
} from "@/lib/articles";
import { extractTitle } from "@/lib/markdown";
import { Category, ArticleMeta } from "@/types";

export const dynamic = "force-dynamic";

const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB

const DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`;

const COLOR_PALETTE = [
  "#EEF2FF",
  "#FEF3C7",
  "#DCFCE7",
  "#FFE4E6",
  "#E0E7FF",
  "#FDE68A",
  "#D1FAE5",
  "#FECDD3",
  "#DBEAFE",
  "#FEF9C3",
  "#CFFAFE",
  "#FCE7F3",
];

function titleCase(kebab: string): string {
  return kebab
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface ImportResult {
  success: boolean;
  categoriesCreated: string[];
  categoriesExisting: string[];
  subcategoriesCreated: string[];
  articlesCreated: string[];
  articlesSkipped: string[];
  articlesOverwritten: string[];
  errors: string[];
  totalFiles: number;
  totalProcessed: number;
}

interface FolderEntry {
  filename: string;
  path: string;
  subfolder?: string;
}

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const defaultStatus = (formData.get("defaultStatus") as string) || "published";
    const conflictStrategy = (formData.get("conflictStrategy") as string) || "skip";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip") && file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
      return NextResponse.json({ error: "Invalid file type. Please upload a .zip file" }, { status: 400 });
    }

    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 50MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    // Collect all .md file paths
    const mdPaths: string[] = [];
    zip.forEach((relativePath, entry) => {
      if (!entry.dir && relativePath.endsWith(".md")) {
        mdPaths.push(relativePath);
      }
    });

    if (mdPaths.length === 0) {
      return NextResponse.json({
        success: true,
        categoriesCreated: [],
        categoriesExisting: [],
        subcategoriesCreated: [],
        articlesCreated: [],
        articlesSkipped: [],
        articlesOverwritten: [],
        errors: ["No .md files found in the ZIP"],
        totalFiles: 0,
        totalProcessed: 0,
      } as ImportResult);
    }

    // Detect if ZIP has a wrapper root folder
    const parts = mdPaths.map((p) => p.split("/"));
    const minDepth = Math.min(...parts.map((p) => p.length));

    let stripPrefix = "";
    if (minDepth >= 3) {
      const firstDirs = new Set(parts.map((p) => p[0]));
      if (firstDirs.size === 1) {
        stripPrefix = parts[0][0] + "/";
      }
    }

    // Build folder -> files map, supporting subcategories
    // Structure: folderMap[topFolder] = [{ filename, path, subfolder? }]
    const folderMap = new Map<string, FolderEntry[]>();

    for (const mdPath of mdPaths) {
      const cleanPath = stripPrefix ? mdPath.slice(stripPrefix.length) : mdPath;
      const segments = cleanPath.split("/");

      if (segments.length < 2) continue;

      const topFolder = segments[0];
      const filename = segments[segments.length - 1];

      // Detect subcategory: folder/subfolder/file.md (3 segments)
      const subfolder = segments.length >= 3 ? segments[1] : undefined;

      if (!folderMap.has(topFolder)) {
        folderMap.set(topFolder, []);
      }
      folderMap.get(topFolder)!.push({ filename, path: mdPath, subfolder });
    }

    // Load existing data
    const existingCategoriesData = await getCategories();
    const existingCategories = existingCategoriesData.categories;
    const existingArticles = await listAllArticles();
    const existingSlugs = new Set(existingArticles.map((a) => a.slug));

    const result: ImportResult = {
      success: true,
      categoriesCreated: [],
      categoriesExisting: [],
      subcategoriesCreated: [],
      articlesCreated: [],
      articlesSkipped: [],
      articlesOverwritten: [],
      errors: [],
      totalFiles: mdPaths.length,
      totalProcessed: 0,
    };

    // Create categories and subcategories
    const categoryMap = new Map<string, string>(); // "folder" or "folder/subfolder" -> category id
    const newCategories: Category[] = [...existingCategories];
    let colorIndex = existingCategories.length;

    const sortedFolders = Array.from(folderMap.keys()).sort();

    for (const folder of sortedFolders) {
      // Create or find top-level category
      const existingParent = existingCategories.find(
        (c) => c.slug === folder && !c.parentId
      );
      let parentId: string;

      if (existingParent) {
        parentId = existingParent.id;
        categoryMap.set(folder, parentId);
        if (!result.categoriesExisting.includes(existingParent.title)) {
          result.categoriesExisting.push(existingParent.title);
        }
      } else {
        // Check if already created in this import
        const alreadyCreated = newCategories.find(
          (c) => c.slug === folder && !c.parentId
        );
        if (alreadyCreated) {
          parentId = alreadyCreated.id;
          categoryMap.set(folder, parentId);
        } else {
          const newCat: Category = {
            id: crypto.randomUUID(),
            title: titleCase(folder),
            description: "",
            slug: folder,
            icon: DEFAULT_ICON,
            iconBgColor: COLOR_PALETTE[colorIndex % COLOR_PALETTE.length],
            order: newCategories.filter((c) => !c.parentId).length,
            parentId: null,
          };
          newCategories.push(newCat);
          parentId = newCat.id;
          categoryMap.set(folder, parentId);
          result.categoriesCreated.push(newCat.title);
          colorIndex++;
        }
      }

      // Collect unique subfolders for this top-level folder
      const files = folderMap.get(folder)!;
      const subfolders = new Set(
        files.filter((f) => f.subfolder).map((f) => f.subfolder!)
      );

      for (const sub of Array.from(subfolders).sort()) {
        const subKey = `${folder}/${sub}`;
        const existingSub = existingCategories.find(
          (c) => c.slug === sub && c.parentId === parentId
        );

        if (existingSub) {
          categoryMap.set(subKey, existingSub.id);
        } else {
          const alreadyCreatedSub = newCategories.find(
            (c) => c.slug === sub && c.parentId === parentId
          );
          if (alreadyCreatedSub) {
            categoryMap.set(subKey, alreadyCreatedSub.id);
          } else {
            const newSub: Category = {
              id: crypto.randomUUID(),
              title: titleCase(sub),
              description: "",
              slug: sub,
              icon: DEFAULT_ICON,
              iconBgColor: COLOR_PALETTE[colorIndex % COLOR_PALETTE.length],
              order: newCategories.filter((c) => c.parentId === parentId).length,
              parentId,
            };
            newCategories.push(newSub);
            categoryMap.set(subKey, newSub.id);
            result.subcategoriesCreated.push(`${titleCase(folder)} > ${newSub.title}`);
            colorIndex++;
          }
        }
      }
    }

    // Save categories
    await saveCategories({ categories: newCategories });

    // Process articles in batches
    const articleTasks: {
      slug: string;
      content: string;
      meta: ArticleMeta;
      isOverwrite: boolean;
    }[] = [];

    const folderEntries = Array.from(folderMap.entries());
    for (const [folder, files] of folderEntries) {
      // Group files by their target category (top-level or subcategory)
      const groupedByTarget = new Map<string, FolderEntry[]>();

      for (const file of files) {
        const targetKey = file.subfolder ? `${folder}/${file.subfolder}` : folder;
        if (!groupedByTarget.has(targetKey)) {
          groupedByTarget.set(targetKey, []);
        }
        groupedByTarget.get(targetKey)!.push(file);
      }

      for (const [targetKey, targetFiles] of Array.from(groupedByTarget.entries())) {
        const categoryId = categoryMap.get(targetKey)!;
        const sortedFiles = [...targetFiles].sort((a, b) => a.filename.localeCompare(b.filename));

        for (let i = 0; i < sortedFiles.length; i++) {
          const { filename, path } = sortedFiles[i];
          const slug = filename.replace(/\.md$/, "");

          try {
            const entry = zip.file(path);
            if (!entry) continue;

            const content = await entry.async("string");

            // Check for conflicts
            if (existingSlugs.has(slug)) {
              if (conflictStrategy === "skip") {
                result.articlesSkipped.push(slug);
                result.totalProcessed++;
                continue;
              }
            }

            const title = extractTitle(content) || titleCase(slug);
            const now = new Date().toISOString();

            const meta: ArticleMeta = {
              title,
              slug,
              category: categoryId,
              status: defaultStatus as "published" | "draft",
              createdAt: now,
              updatedAt: now,
              order: i,
            };

            articleTasks.push({
              slug,
              content,
              meta,
              isOverwrite: existingSlugs.has(slug),
            });
          } catch (err) {
            result.errors.push(`Error processing ${path}: ${err instanceof Error ? err.message : String(err)}`);
            result.totalProcessed++;
          }
        }
      }
    }

    // Save articles in batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < articleTasks.length; i += BATCH_SIZE) {
      const batch = articleTasks.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (task) => {
          try {
            await Promise.all([
              saveArticleMeta(task.slug, task.meta),
              saveArticleContent(task.slug, task.content),
            ]);
            if (task.isOverwrite) {
              result.articlesOverwritten.push(task.slug);
            } else {
              result.articlesCreated.push(task.slug);
            }
          } catch (err) {
            result.errors.push(
              `Error saving ${task.slug}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
          result.totalProcessed++;
        })
      );
    }

    cacheInvalidateAll();

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Import failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
