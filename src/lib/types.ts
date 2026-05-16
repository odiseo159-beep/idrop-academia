export type Locale = "en" | "es";
export type ModuleStatus = "available" | "coming-soon";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Chain = "bnb" | "ethereum" | "solana" | "multi";

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation?: string;
}

export interface VideoChapter {
  /** Timestamp like "0:00", "1:24", "12:34" (mm:ss or h:mm:ss). */
  time: string;
  title: string;
}

export interface LessonFrontmatter {
  title: string;
  description: string;
  duration: number; // minutes
  xp: number;
  order: number;
  quiz?: QuizQuestion[];
  /**
   * Optional video for the lesson interior. Three accepted forms:
   *   - YouTube embed: "https://www.youtube.com/embed/XXXXXXXXXXX"
   *   - Vimeo embed:   "https://player.vimeo.com/video/XXXXXXXXX"
   *   - Direct file:   "/videos/m01-l01.mp4" or absolute URL ending in .mp4/.webm
   * When absent, the lesson page renders an editorial "video próximamente" placeholder.
   */
  videoUrl?: string;
  /** Optional duration in seconds; used by chapter ticks + the title-band meta row. */
  videoDurationSec?: number;
  /** Video reading minutes split: used in the module sumario "§ TOMAR LA LECCIÓN" block.
   * If absent the sumario derives it from `videoDurationSec / 60`. */
  videoMin?: number;
  /** Reading minutes (MDX body, excluding video). The sumario shows it as "Lectura · N min". */
  readingMin?: number;
  /** Optional chapter markers shown under the video and in the right-rail. */
  videoChapters?: VideoChapter[];
  /** One-line tagline shown in "§ DE QUÉ TRATA" when the lesson row is expanded. */
  tagline?: string;
  /** 3 short "§1/§2/§3" bullets shown in "§ CUBRE" when the lesson row is expanded. */
  bullets?: string[];
}

export interface LessonMeta extends LessonFrontmatter {
  slug: string;
  moduleSlug: string;
}

export interface ModuleManifest {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  chain: Chain;
  difficulty: Difficulty;
  status: ModuleStatus;
  durationMinutes: number;
  totalXp: number;
  totalLessons: number;
  category: string;
  icon: string;
  accent: "pink" | "purple" | "orange" | "cyan" | "primary";
  tags: string[];
  prerequisites?: string[];
  /** Editorial subtitle for the module hero (3-segment line). */
  hookLine?: string;
  /** Module-level outcomes shown in the "§ LO QUE VAS A APRENDER" block. */
  learningOutcomes?: string[];
  /** Glossary terms shown as chips in "§ CONCEPTOS CLAVE". */
  keyConcepts?: string[];
  /** Slug of the next recommended module — drives the "DESPUÉS DE M.XX" card. */
  suggestedNext?: string;
}

export interface Module extends ModuleManifest {
  lessons: LessonMeta[];
}

export interface UserProgress {
  completedLessons: Record<string, number>; // key: `${moduleSlug}/${lessonSlug}` -> timestamp
  totalXp: number;
  modulesStarted: string[];
  modulesCompleted: string[];
  lastActivity?: number;
  /** Daily-quest streak (consecutive days with any lesson completed). */
  streakDays?: number;
  /** Date-string (YYYY-MM-DD) of the last day a lesson was completed. */
  lastStreakDay?: string;
}

/**
 * Per-lesson timestamped notes the user takes while watching the video.
 * Stored locally only — never synced onchain (privacy + cost).
 */
export interface LessonNote {
  id: string;
  /** mm:ss timestamp inside the video, e.g. "1:42". */
  time: string;
  text: string;
  createdAt: number;
}
