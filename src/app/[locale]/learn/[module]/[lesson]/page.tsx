import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { setRequestLocale } from "next-intl/server";
import { mdxComponents } from "@/components/learn/mdx-components";
import { V2Masthead } from "@/components/v2/v2-masthead";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { LessonBreadcrumb } from "@/components/v2/lesson-breadcrumb";
import { LessonTitleBand } from "@/components/v2/lesson-title-band";
import { LessonPrevNext } from "@/components/v2/lesson-prev-next";
import { LessonExperience } from "@/components/v2/lesson-experience";
import {
  getAllModuleSlugs,
  getLessonContent,
  getLessonNeighbors,
  getModule,
} from "@/lib/modules";
import { moduleCodeFor } from "@/lib/module-order";
import { formatDuration } from "@/lib/video";
import type { Locale } from "@/lib/types";

interface PageProps {
  params: Promise<{ module: string; lesson: string; locale: Locale }>;
}

export async function generateStaticParams() {
  const slugs = await getAllModuleSlugs();
  const all: { module: string; lesson: string }[] = [];
  for (const s of slugs) {
    try {
      const mod = await getModule(s);
      for (const l of mod.lessons) all.push({ module: s, lesson: l.slug });
    } catch {
      // skip stubs without lessons
    }
  }
  return all;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { module: m, lesson: l, locale } = await params;
  try {
    const { meta } = await getLessonContent(m, l, locale);
    return {
      title: `${meta.title} — IDROP`,
      description: meta.description,
    };
  } catch {
    return { title: "Lesson not found — IDROP" };
  }
}

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://academia.idrop.so";
const QUIZ_XP_BONUS = 25; // carved out of the lesson's total XP

/**
 * Lesson interior page — v2 cinema layout.
 *
 *   ┌────────────────────────────────────────────┐
 *   │ V2Masthead                                 │
 *   ├────────────────────────────────────────────┤
 *   │ Breadcrumb · progress bar                  │
 *   │ Title band (60px serif + meta column)      │
 *   │ ┌──────────────┬────────────────────────┐  │
 *   │ │ Video 1080   │ Module rail            │  │
 *   │ │ Chapter strip│ Actions                │  │
 *   │ │ Article body │ Notes                  │  │
 *   │ │ Quiz card    │ Quest hook             │  │
 *   │ │ Prev / Next  │ Wallet hint (if no wlt)│  │
 *   │ └──────────────┴────────────────────────┘  │
 *   │ Footer ticker                              │
 *   └────────────────────────────────────────────┘
 */
export default async function LessonPage({ params }: PageProps) {
  const { module: moduleSlug, lesson: lessonSlug, locale } = await params;
  setRequestLocale(locale);

  let source: string;
  let meta;
  try {
    const data = await getLessonContent(moduleSlug, lessonSlug, locale);
    source = data.source;
    meta = data.meta;
  } catch {
    notFound();
  }

  const { prev, next, module: mod } = await getLessonNeighbors(
    moduleSlug,
    lessonSlug,
    locale
  );

  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
    },
  });

  const orderIndex = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  const lessonOrder = orderIndex >= 0 ? orderIndex + 1 : meta.order ?? 1;
  const lessonCode = `L.${String(lessonOrder).padStart(2, "0")}`;
  const moduleCode = moduleCodeFor(moduleSlug);

  // Spanish "lección uno · de cuatro" style label, falls back to digits.
  const ordinalEs = ["UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE"];
  const totalEs = ["UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE"];
  const lessonOrderLabel =
    locale === "es"
      ? `LECCIÓN ${ordinalEs[lessonOrder - 1] ?? String(lessonOrder).padStart(2, "0")} · DE ${totalEs[mod.totalLessons - 1] ?? mod.totalLessons}`
      : `LESSON ${String(lessonOrder).padStart(2, "0")} · OF ${mod.totalLessons}`;

  const videoDurationLabel = meta.videoDurationSec
    ? formatDuration(meta.videoDurationSec)
    : `${meta.duration} ${locale === "es" ? "min" : "min"}`;

  const lessonAbsoluteUrl = `${SITE_ORIGIN}/${locale}/learn/${moduleSlug}/${lessonSlug}`;

  return (
    <div style={{ background: "var(--color-ink-0)", minHeight: "100vh", position: "relative" }}>
      <V2Masthead />

      <LessonBreadcrumb
        moduleSlug={moduleSlug}
        moduleCode={moduleCode}
        moduleTitle={mod.title}
        lessonCode={lessonCode}
        lessonTitle={meta.title}
        lessonSlug={lessonSlug}
        moduleTotalLessons={mod.totalLessons}
        moduleTotalXp={mod.totalXp}
        lessonXp={meta.xp}
        lessonOrder={lessonOrder}
      />

      <LessonTitleBand
        locale={locale}
        moduleCode={moduleCode}
        lessonOrderLabel={lessonOrderLabel}
        title={meta.title}
        description={meta.description}
        videoDurationLabel={videoDurationLabel}
        readingMinutes={meta.duration}
        quizXp={QUIZ_XP_BONUS}
        totalXp={meta.xp}
        completed={false /* the client wrapper paints the ✓ state once hydrated */}
      />

      <LessonExperience
        moduleSlug={moduleSlug}
        moduleCode={moduleCode}
        moduleCategory={mod.category}
        moduleTitle={mod.title}
        moduleTotalLessons={mod.totalLessons}
        moduleTotalMin={mod.durationMinutes}
        moduleTotalXp={mod.totalXp}
        moduleLessons={mod.lessons}
        lessonSlug={lessonSlug}
        lessonCode={lessonCode}
        lessonTitle={meta.title}
        lessonXp={meta.xp}
        videoUrl={meta.videoUrl}
        videoDurationSec={meta.videoDurationSec}
        videoDurationLabel={videoDurationLabel}
        videoChapters={meta.videoChapters}
        quiz={meta.quiz}
        nextLesson={
          next
            ? {
                slug: next.slug,
                title: next.title,
                order: next.order,
                durationMin: next.duration,
                xp: next.xp,
              }
            : null
        }
        lessonUrl={lessonAbsoluteUrl}
        quizXp={QUIZ_XP_BONUS}
        body={content}
        prevNext={
          <LessonPrevNext
            locale={locale}
            moduleSlug={moduleSlug}
            prev={
              prev
                ? {
                    slug: prev.slug,
                    title: prev.title,
                    order: prev.order,
                    durationMin: prev.duration,
                    xp: prev.xp,
                  }
                : null
            }
            next={
              next
                ? {
                    slug: next.slug,
                    title: next.title,
                    order: next.order,
                    durationMin: next.duration,
                    xp: next.xp,
                  }
                : null
            }
            celebrating={false /* client wrapper would re-render with the bnb border once completed */}
          />
        }
      />

      <V2Ticker locale={locale} />
    </div>
  );
}
