import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import type { Course, Module, Lesson } from "@/types/course";

/**
 * Normalize course data coming from Firebase so the UI always gets a predictable shape:
 * - modules is an array (sorted by order)
 * - each module has an array of lessons (sorted by order)
 * - each lesson has a non-empty id, title, type, content, duration, and order
 *
 * Also extracts lesson bodies if they were stored wrapped in markers like <<BEGIN_LESSON>>...<<END_LESSON>>.
 */

function extractBetweenMarkers(raw: string | undefined) {
  if (!raw || typeof raw !== "string") return "";
  const start = raw.indexOf("<<BEGIN_LESSON>>");
  const end = raw.indexOf("<<END_LESSON>>");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start + "<<BEGIN_LESSON>>".length, end).trim();
  }
  return raw.trim();
}

function ensureArrayFromPossibleObject<T>(value: any): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") return Object.values(value) as T[];
  return [];
}

function sortByOrder<T extends { order?: number }>(arr: T[]) {
  return arr.slice().sort((a, b) => {
    const ao = Number.isFinite(a?.order) ? (a!.order as number) : Infinity;
    const bo = Number.isFinite(b?.order) ? (b!.order as number) : Infinity;
    return ao - bo;
  });
}

function normalizeCourseData(rawCourse: any, courseId?: string): Course {
  const modulesRaw: any[] = ensureArrayFromPossibleObject<any>(rawCourse?.modules);

  // sort modules by explicit order if present to preserve intended sequencing
  const modulesSorted = sortByOrder(modulesRaw);

  const normalizedModules: Module[] = modulesSorted.map((m: any, modIdx: number) => {
    const lessonsRaw: any[] = ensureArrayFromPossibleObject<any>(m?.lessons);

    // sort lessons by order when available
    const lessonsSorted = sortByOrder(lessonsRaw);

    const normalizedLessons: Lesson[] = lessonsSorted
      .map((l: any, li: number) => {
        if (!l || typeof l !== "object") return null;

        const id = typeof l.id === "string" && l.id.trim() ? l.id : `lesson_${uuidv4()}`;

        const allowedTypes = ["article", "code-along", "quiz", "video"];
        const type = allowedTypes.includes(l.type) ? l.type : "article";

        // If lesson.content contains marker-wrapped content, extract inner body
        const rawContent = typeof l.content === "string" ? l.content : "";
        const contentExtracted = extractBetweenMarkers(rawContent) || rawContent.trim();

        // If still empty, keep a short placeholder so UI can show something
        const content = contentExtracted.length > 0 ? contentExtracted : `This lesson content is being prepared.`;

        return {
          // preserve any extra fields while ensuring required ones exist
          ...l,
          id,
          title: l.title || `Untitled Lesson ${li + 1}`,
          type,
          content,
          duration: l.duration || "5 mins",
          order: Number.isFinite(l.order) ? l.order : li + 1,
        } as Lesson;
      })
      .filter(Boolean) as Lesson[];

    return {
      ...m,
      title: m?.title || `Module ${modIdx + 1}`,
      order: Number.isFinite(m?.order) ? m.order : modIdx + 1,
      lessons: normalizedLessons,
    } as Module;
  });

  return {
    // preserve original metadata but ensure id & modules are normalized
    ...rawCourse,
    id: courseId || rawCourse?.id || "",
    modules: normalizedModules,
  } as Course;
}

/**
 * Fetches all AI-generated courses from Firebase Realtime Database and normalizes them.
 */
export async function getAllCourses(): Promise<Course[]> {
  const coursesRef = ref(db, "courses");
  const snapshot = await get(coursesRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();

  const coursesArray: Course[] = Object.keys(data).map((courseId) =>
    normalizeCourseData(data[courseId], courseId)
  );

  return coursesArray;
}

/**
 * Fetches a single course by its slug (used on the course detail/lesson page) and normalizes it.
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const coursesRef = ref(db, "courses");
  const snapshot = await get(coursesRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.val();

  const matchingCourseId = Object.keys(data).find(
    (courseId) => data[courseId]?.slug === slug
  );

  if (matchingCourseId) {
    return normalizeCourseData(data[matchingCourseId], matchingCourseId);
  }

  return null;
}