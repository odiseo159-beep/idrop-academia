import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type {
  LessonFrontmatter,
  LessonMeta,
  Module,
  ModuleManifest,
  Locale,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "modules");
const DEFAULT_LOCALE: Locale = "en";

interface RawManifestI18n {
  title: string;
  tagline: string;
  description: string;
  /** Optional editorial hook line shown under the H1 (e.g. "DE DÓNDE VIENE · …"). */
  hookLine?: string;
  /** Optional 4 learning outcomes shown in "§ LO QUE VAS A APRENDER". */
  learningOutcomes?: string[];
}

interface RawManifest extends Omit<ModuleManifest, "title" | "tagline" | "description" | "hookLine" | "learningOutcomes"> {
  i18n: Record<Locale, RawManifestI18n>;
}

async function readManifest(slug: string, locale: Locale): Promise<ModuleManifest> {
  const file = await fs.readFile(
    path.join(CONTENT_ROOT, slug, "module.json"),
    "utf-8"
  );
  const data = JSON.parse(file) as RawManifest;
  const localized = data.i18n[locale] ?? data.i18n[DEFAULT_LOCALE];
  const { i18n, ...rest } = data;
  void i18n;
  return {
    ...rest,
    slug,
    title: localized.title,
    tagline: localized.tagline,
    description: localized.description,
    hookLine: localized.hookLine,
    learningOutcomes: localized.learningOutcomes,
  } as ModuleManifest;
}

async function resolveLessonFile(
  moduleSlug: string,
  lessonSlug: string,
  locale: Locale
): Promise<string | null> {
  const dir = path.join(CONTENT_ROOT, moduleSlug);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return null;
  }
  const baseMatch = (f: string) =>
    f.replace(/\.[a-z]{2}\.mdx?$/, "").replace(/\.mdx?$/, "").replace(/^\d+-/, "") ===
    lessonSlug;

  // 1. Prefer locale-specific file: 01-foo.es.mdx
  const localized = files.find(
    (f) => f.endsWith(`.${locale}.mdx`) && baseMatch(f)
  );
  if (localized) return localized;

  // 2. Fall back to default-locale file: 01-foo.mdx
  const fallback = files.find(
    (f) => f.endsWith(".mdx") && !/\.[a-z]{2}\.mdx$/.test(f) && baseMatch(f)
  );
  return fallback ?? null;
}

async function readLesson(
  moduleSlug: string,
  filename: string
): Promise<LessonMeta> {
  const filePath = path.join(CONTENT_ROOT, moduleSlug, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data } = matter(raw);
  const fm = data as LessonFrontmatter;
  const slug = filename
    .replace(/\.[a-z]{2}\.mdx?$/, "")
    .replace(/\.mdx?$/, "")
    .replace(/^\d+-/, "");
  return {
    ...fm,
    slug,
    moduleSlug,
  };
}

export async function getLessonContent(
  moduleSlug: string,
  lessonSlug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<{ source: string; meta: LessonMeta }> {
  const target = await resolveLessonFile(moduleSlug, lessonSlug, locale);
  if (!target) throw new Error(`Lesson not found: ${moduleSlug}/${lessonSlug}`);
  const raw = await fs.readFile(
    path.join(CONTENT_ROOT, moduleSlug, target),
    "utf-8"
  );
  const { content, data } = matter(raw);
  const fm = data as LessonFrontmatter;
  return {
    source: content,
    meta: { ...fm, slug: lessonSlug, moduleSlug },
  };
}

export async function getModule(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<Module> {
  const manifest = await readManifest(slug, locale);
  if (manifest.status === "coming-soon") {
    return { ...manifest, lessons: [] };
  }
  const dir = path.join(CONTENT_ROOT, slug);
  const allFiles = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));

  // Get unique lesson slugs from filenames (stripping locale suffix)
  const baseSlugs = new Set<string>();
  for (const f of allFiles) {
    baseSlugs.add(
      f.replace(/\.[a-z]{2}\.mdx?$/, "").replace(/\.mdx?$/, "")
    );
  }

  // For each base slug, prefer the locale-specific file, fall back to default
  const lessons: LessonMeta[] = [];
  for (const baseSlug of baseSlugs) {
    const localized = allFiles.find((f) => f === `${baseSlug}.${locale}.mdx`);
    const fallback = allFiles.find(
      (f) => f === `${baseSlug}.mdx`
    );
    const file = localized ?? fallback;
    if (file) lessons.push(await readLesson(slug, file));
  }
  lessons.sort((a, b) => a.order - b.order);
  return { ...manifest, lessons };
}

export async function getAllModules(locale: Locale = DEFAULT_LOCALE): Promise<Module[]> {
  const dirs = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  const slugs = dirs.filter((d) => d.isDirectory()).map((d) => d.name);
  const modules = await Promise.all(slugs.map((s) => getModule(s, locale)));
  return modules.sort((a, b) => {
    if (a.status === b.status) return a.title.localeCompare(b.title);
    return a.status === "available" ? -1 : 1;
  });
}

export async function getAllModuleSlugs(): Promise<string[]> {
  const dirs = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  return dirs.filter((d) => d.isDirectory()).map((d) => d.name);
}

export async function getLessonNeighbors(
  moduleSlug: string,
  lessonSlug: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<{ prev: LessonMeta | null; next: LessonMeta | null; module: Module }> {
  const mod = await getModule(moduleSlug, locale);
  const idx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  return {
    prev: idx > 0 ? mod.lessons[idx - 1] : null,
    next: idx >= 0 && idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null,
    module: mod,
  };
}
