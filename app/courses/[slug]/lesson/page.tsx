// app/courses/[slug]/lesson/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  BookOpen,
  List,
  ChevronUp,
  ChevronDown,
  Award,
  GraduationCap,
} from "lucide-react";
import { getCourseBySlug } from "@/services/course";
import { useAuth } from "@/context/AuthContext";
import { useCourseContext } from "@/context/CourseContext";
import type { Course, Lesson, Module } from "@/types/course";
import Loader from "@/components/Loader";

import { db } from "@/lib/firebase";
import {
  ref as dbRef,
  get as dbGet,
  update as dbUpdate,
  query as dbQuery,
  orderByChild as dbOrderByChild,
  equalTo as dbEqualTo,
} from "firebase/database";

// ==========================================
// UTILITIES
// ==========================================

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function makeIdGenerator() {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base = text.toString().trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    const prev = counts.get(base) ?? 0;
    const id = prev === 0 ? base : `${base}-${prev + 1}`;
    counts.set(base, prev + 1);
    return id;
  };
}

function parseHeadings(content: string): TocItem[] {
  if (!content) return [];
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  const genId = makeIdGenerator();
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = genId(text);
    headings.push({ id, text, level });
  }
  return headings;
}

function renderMarkdown(content: string): string {
  if (!content) return "";
  const genId = makeIdGenerator();
  let html = content
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
      `<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-6 text-sm"><code>${code}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="bg-orange-50 text-orange-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  html = html
    .replace(/^#\s+(.+)$/gm, (_, text) => {
      const id = genId(text);
      return `<h2 id="${id}" class="text-2xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100 scroll-mt-6">${text.trim()}</h2>`;
    })
    .replace(/^##\s+(.+)$/gm, (_, text) => {
      const id = genId(text);
      return `<h3 id="${id}" class="text-xl font-bold text-gray-900 mt-8 mb-3 scroll-mt-6">${text.trim()}</h3>`;
    })
    .replace(/^###\s+(.+)$/gm, (_, text) => {
      const id = genId(text);
      return `<h4 id="${id}" class="text-lg font-semibold text-gray-900 mt-6 mb-2 scroll-mt-6">${text.trim()}</h4>`;
    });

  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[\-\*]\s+(.+)$/gm, '<li class="ml-4 list-disc marker:text-orange-500">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal marker:text-orange-500">$1</li>')
    .replace(/((?:<li class="ml-4 list-disc[^]*?<\/li>\n?)+)/g, '<ul class="my-4 space-y-2 text-gray-700">$1</ul>')
    .replace(/((?:<li class="ml-4 list-decimal[^]*?<\/li>\n?)+)/g, '<ol class="my-4 space-y-2 text-gray-700">$1</ol>')
    .replace(/^(?!<[a-z])((?!<\/)[^\n]+)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>')
    .replace(/\n{3,}/g, '\n\n');

  return html;
}

function slugify(text = "") {
  return text.toString().trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

function normalizeCourseIds(course: Course): Course {
  if (!course) return course;
  const idCounts = new Map<string, number>();
  const modules = (course.modules || []).map((mod, modIdx) => {
    const lessons = (mod.lessons || []).map((les, lesIdx) => {
      const base = les.id || slugify(les.title || `mod${modIdx}-les${lesIdx}`);
      const prev = idCounts.get(base) ?? 0;
      const id = prev === 0 ? base : `${base}-${prev + 1}`;
      idCounts.set(base, prev + 1);
      return { ...les, id, title: les.title || "Untitled Lesson" } as Lesson;
    });
    const modBase = mod.id || `module-${modIdx}`;
    const modPrev = idCounts.get(modBase) ?? 0;
    const modId = modPrev === 0 ? modBase : `${modBase}-${modPrev + 1}`;
    idCounts.set(modBase, modPrev + 1);
    return { ...mod, id: modId, lessons };
  });
  return { ...course, modules };
}

function getYoutubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const LESSON_COMPLETE_THRESHOLD = 100;

// ==========================================
// COMPONENT
// ==========================================

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { user } = useAuth();
  const { getEnrollment, isEnrolled, enrollCourse, markLessonComplete, updateLessonProgress } =
    (useCourseContext() as any) || {};

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(true);
  
  const [learningMode, setLearningMode] = useState<'text' | 'video'>('text');
  const [videoOverrides, setVideoOverrides] = useState<Record<string, string>>({});

  const generatingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return (course.modules || []).reduce<Lesson[]>((acc, module, mIdx) => {
      if (!module?.lessons) return acc;
      const validLessons = module.lessons
        .filter((l): l is Lesson => !!l && (!!l.id || !!l.title))
        .map((lesson, lIdx) => ({
          ...lesson,
          id: lesson.id || `mod${mIdx}-les${lIdx}-${(lesson.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          duration: lesson.duration || "10 mins",
          _moduleTitle: module.title,
          _moduleOrder: module.order ?? mIdx + 1,
        }));
      return [...acc, ...validLessons];
    }, []);
  }, [course?.modules]);

  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const courseId = course?.id;
  const enrolled = user && courseId ? isEnrolled?.(courseId) : false;
  const enrollment = user && courseId ? getEnrollment?.(courseId) : undefined;

  const rawVideoUrl = (currentLesson as any)?.videoUrl || (currentLesson as any)?.youtubeUrl || "";
  const videoUrl = (currentLessonId && videoOverrides[currentLessonId]) || rawVideoUrl;
  const hasVideo = !!videoUrl;
  const youtubeId = getYoutubeId(videoUrl);

  const hasContent = currentLesson?.content && currentLesson.content.trim().length > 100;
  const hasAnyContent = hasContent || hasVideo;
  
  const displayContent = currentLesson?.content || "";
  const renderedHtml = useMemo(() => renderMarkdown(displayContent), [displayContent]);
  const tocItems = useMemo(() => parseHeadings(displayContent), [displayContent]);

  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});
  const persistTimeoutRef = useRef<number | null>(null);
  const localStorageKey = (cid?: string) => `course_progress_${cid || courseId || "unknown"}`;

  useEffect(() => {
    const init: Record<string, number> = {};
    if (enrollment && typeof enrollment === "object" && (enrollment as any).lessonProgress) {
      const lp = (enrollment as any).lessonProgress;
      if (lp && typeof lp === "object") {
        for (const k of Object.keys(lp)) {
          const v = Number(lp[k]) || 0;
          init[k] = Math.min(100, Math.max(0, v));
        }
      }
    }
    if (enrollment && Array.isArray((enrollment as any).completedLessons)) {
      for (const cid of (enrollment as any).completedLessons) {
        if (typeof cid === "string") init[cid] = 100;
      }
    }
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(localStorageKey()) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const k of Object.keys(parsed)) {
            const v = Number(parsed[k]) || 0;
            init[k] = Math.max(init[k] ?? 0, Math.min(100, Math.max(0, v)));
          }
        }
      }
    } catch (e) {}
    setLessonProgress(init);
  }, [courseId, enrollment, course]);

  const persistLessonProgress = async (lessonId: string, percent: number) => {
    try {
      if (updateLessonProgress && typeof updateLessonProgress === "function") {
        updateLessonProgress(courseId, lessonId, percent).catch((e: any) => console.error("updateLessonProgress failed:", e));
      }
    } catch (e) {}
    try {
      const key = localStorageKey();
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      const parsed = raw && JSON.parse(raw) ? (JSON.parse(raw) as Record<string, number>) : {};
      parsed[lessonId] = Math.min(100, Math.max(0, percent));
      if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(parsed));
    } catch (e) {}
  };

  const setProgressForLesson = (lessonId: string, percent: number) => {
    setLessonProgress((prev) => {
      const prevVal = prev[lessonId] ?? 0;
      const nextVal = Math.max(prevVal, Math.min(100, Math.round(percent)));
      if (nextVal === prevVal) return prev;
      return { ...prev, [lessonId]: nextVal };
    });
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = window.setTimeout(() => {
      persistLessonProgress(lessonId, Math.min(100, Math.round(percent)));
      persistTimeoutRef.current = null;
    }, 1000);
  };

  const completedCount = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return 0;
    let count = 0;
    const completedSet = new Set<string>();
    if (enrollment && Array.isArray((enrollment as any).completedLessons)) {
      for (const id of (enrollment as any).completedLessons) if (typeof id === "string") completedSet.add(id);
    }
    for (const les of allLessons) {
      const p = lessonProgress[les.id] ?? 0;
      if (p >= LESSON_COMPLETE_THRESHOLD) { count++; continue; }
      const titleSlug = slugify(les.title || "");
      const titleLower = (les.title || "").toLowerCase();
      if (completedSet.has(les.id) || completedSet.has(titleSlug) || completedSet.has(titleLower)) count++;
    }
    return count;
  }, [lessonProgress, allLessons, enrollment]);

  const allLessonsCompleted = useMemo(() => allLessons.length > 0 && completedCount >= allLessons.length, [completedCount, allLessons.length]);

  const isCompleted = useMemo(() => {
    if (!currentLesson) return false;
    const p = lessonProgress[currentLesson.id] ?? 0;
    if (p >= LESSON_COMPLETE_THRESHOLD) return true;
    if (enrollment && Array.isArray((enrollment as any).completedLessons)) {
      const set = new Set((enrollment as any).completedLessons.map(String));
      const titleSlug = slugify(currentLesson.title || "");
      const titleLower = (currentLesson.title || "").toLowerCase();
      if (set.has(currentLesson.id) || set.has(titleSlug) || set.has(titleLower)) return true;
    }
    return false;
  }, [lessonProgress, currentLesson, enrollment]);

  function isLessonMarkedCompleted(les: Lesson) {
    const p = lessonProgress[les.id] ?? 0;
    if (p >= LESSON_COMPLETE_THRESHOLD) return true;
    if (enrollment && Array.isArray((enrollment as any).completedLessons)) {
      const set = new Set((enrollment as any).completedLessons.map(String));
      const titleSlug = slugify(les.title || "");
      const titleLower = (les.title || "").toLowerCase();
      if (set.has(les.id) || set.has(titleSlug) || set.has(titleLower)) return true;
    }
    return false;
  }

  const isLastLesson = currentIndex === allLessons.length - 1;
  const canTakeExam = enrolled && allLessonsCompleted;

  const displayProgress = useMemo(() => {
    if (allLessons.length === 0) return 0;
    const total = allLessons.reduce((acc, les) => acc + (lessonProgress[les.id] ?? 0), 0);
    return Math.round(total / allLessons.length);
  }, [lessonProgress, allLessons]);
  const displayProgressRounded = Math.round(displayProgress);

  const handlePrev = () => {
    if (prevLesson) {
      setCurrentLessonId(prevLesson.id);
      setScrollProgress(0);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleMarkCompleteAndNext = async () => {
    if (!courseId || !currentLessonId) return;
    if (!markLessonComplete) return console.error("markLessonComplete not available");
    setActionLoading(true);
    try {
      if (!enrolled && enrollCourse) await enrollCourse(courseId);
      await markLessonComplete(courseId, currentLessonId);
      setLessonProgress((prev) => ({ ...prev, [currentLessonId]: 100 }));
      persistLessonProgress(currentLessonId, 100);
      setScrollProgress(0);
      if (nextLesson) {
        setCurrentLessonId(nextLesson.id);
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    async function markCourseCompleteInDB() {
      if (!user?.uid || !courseId) return;
      const currentStatus = enrollment?.status;
      const currentProgress = Number(enrollment?.progress ?? 0);
      if (currentStatus === "completed" || currentProgress >= 100) return;
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const token = await currentUser.getIdToken();
          const res = await fetch("/api/enrollments/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ courseId }),
          });
          if (res.ok) return;
        }
        if (enrollment?.id) {
          const ref = dbRef(db, `users/${user.uid}/enrollments/${enrollment.id}`);
          await dbUpdate(ref, { status: "completed", progress: 100, completedAt: Date.now() });
        }
      } catch (err: any) {
        console.error("markCourseCompleteInDB error:", err);
      }
    }
    if (allLessonsCompleted) markCourseCompleteInDB();
  }, [allLessonsCompleted, user?.uid, courseId, enrollment?.id, enrollment?.status, enrollment?.progress]); 

  useEffect(() => {
    if (!user?.uid || !courseId || allLessons.length === 0) return;
    const syncTimeout = setTimeout(async () => {
      try {
        const totalProgress = allLessons.reduce((acc, les) => acc + (lessonProgress[les.id] ?? 0), 0);
        const overallPercent = Math.round(totalProgress / allLessons.length);
        const userEnrollRef = dbRef(db, `users/${user.uid}/enrollments`);
        const userEnrollSnap = await dbGet(userEnrollRef);
        if (userEnrollSnap.exists()) {
          const enrollments = userEnrollSnap.val();
          const entry = Object.entries(enrollments).find(([_, val]: [string, any]) => val.courseId === courseId);
          if (entry) {
            const [enrollKey] = entry;
            await dbUpdate(dbRef(db, `users/${user.uid}/enrollments/${enrollKey}`), {
              progress: overallPercent, lastAccessed: Date.now(), lessonProgress: lessonProgress,
            });
          }
        }
        try {
          const topRef = dbRef(db, "enrollments");
          const topQuery = dbQuery(topRef, dbOrderByChild("userId"), dbEqualTo(user.uid));
          const topSnap = await dbGet(topQuery);
          if (topSnap.exists()) {
            const entries = Object.entries(topSnap.val());
            const match = entries.find(([_, val]: [string, any]) => val.courseId === courseId);
            if (match) {
              await dbUpdate(dbRef(db, `enrollments/${match[0]}`), {
                progress: overallPercent, lastAccessed: Date.now(), lessonProgress: lessonProgress,
              });
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error("Failed to sync course progress:", err);
      }
    }, 2000);
    return () => clearTimeout(syncTimeout);
  }, [lessonProgress, allLessons, user?.uid, courseId]);

  const handleGenerateLesson = async () => {
    if (!slug || !currentLesson || !course || generatingRef.current) return;
    setGenerating(true);
    generatingRef.current = true;
    try {
      const module = course.modules?.find((m) => m.lessons?.some((l) => l.id === currentLesson.id));
      const queryParams = new URLSearchParams({
        auto_regenerate: "true", lesson_id: currentLesson.id, lesson_title: currentLesson.title || "",
        module_title: module?.title || "", course_title: course.title || "", lesson_type: "article", _t: Date.now().toString(),
      });
      const res = await fetch(`/api/courses/slug/${encodeURIComponent(slug)}?${queryParams.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json?.lessonBody) {
          setCourse((prev) => {
            if (!prev) return prev;
            const newModules = prev.modules?.map((m) => ({
              ...m, lessons: m.lessons?.map((l) => (l.id === currentLesson.id ? { ...l, content: json.lessonBody } : l)),
            }));
            return normalizeCourseIds({ ...prev, modules: newModules });
          });
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setGenerating(false);
      generatingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchMatchingVideo() {
      if (!currentLesson || !currentLessonId) return;
      if (rawVideoUrl || videoOverrides[currentLessonId]) return; 
      
      const query = `${currentLesson.title || ""} ${(currentLesson as any)?._moduleTitle || ""} tutorial`;
      if (!query.trim()) return;
      
      try {
        const res = await fetch(`/api/youtube/match?q=${encodeURIComponent(query)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.video?.url) {
          setVideoOverrides((prev) => ({ ...prev, [currentLessonId]: json.video.url }));
          
          try {
            if (course?.id && course.modules) {
              const mIdx = course.modules.findIndex((m) => m.lessons?.some((l) => l.id === currentLessonId));
              if (mIdx >= 0) {
                const lIdx = course.modules[mIdx].lessons?.findIndex((l) => l.id === currentLessonId) ?? -1;
                if (lIdx >= 0) {
                  await dbUpdate(dbRef(db, `courses/${course.id}/modules/${mIdx}/lessons/${lIdx}`), { videoUrl: json.video.url });
                }
              }
            }
          } catch (e) { /* ignore persistence errors */ }
        }
      } catch (e) {
        console.error("Failed to fetch matching video:", e);
      }
    }
    fetchMatchingVideo();
    return () => { cancelled = true; };
  }, [currentLessonId, rawVideoUrl, course?.id]);

  const scrollToHeading = (id: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const element = container.querySelector(`#${CSS.escape(id)}`) as HTMLElement;
    if (element) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top + container.scrollTop - 24;
      container.scrollTo({ top: offset, behavior: "smooth" });
      setActiveHeading(id);
    }
  };

  const handleScroll = () => {
    if (learningMode !== 'text' || !scrollContainerRef.current || !hasContent || !currentLesson) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return;
    const percent = Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100));
    setScrollProgress(percent);
    const existing = lessonProgress[currentLesson.id] ?? 0;
    const nextPercent = Math.max(existing, Math.round(percent));
    if (nextPercent !== existing) setProgressForLesson(currentLesson.id, nextPercent);
  };

  useEffect(() => {
    async function fetchCourse() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/courses/slug/${encodeURIComponent(slug)}?auto_regenerate=false`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json?.modules && Array.isArray(json.modules) && json.modules.length > 0) {
            setCourse(normalizeCourseIds(json as Course));
          } else {
            const data = await getCourseBySlug(slug);
            if (data) setCourse(normalizeCourseIds(data));
          }
        } else {
          const data = await getCourseBySlug(slug);
          if (data) setCourse(normalizeCourseIds(data));
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
        try {
          const data = await getCourseBySlug(slug);
          if (data) setCourse(normalizeCourseIds(data));
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (!course || currentLessonId) return;
    if (allLessons.length > 0) setCurrentLessonId(allLessons[0].id);
  }, [course, currentLessonId, allLessons]);

  useEffect(() => {
    if (!currentLesson || generatingRef.current) return;
    if (!hasVideo && (!currentLesson.content || currentLesson.content.trim().length < 100)) {
      handleGenerateLesson();
    }
  }, [currentLessonId, hasVideo]);

  useEffect(() => {
    if (hasVideo && !hasContent && !generating) {
      setLearningMode('video');
    }
  }, [hasVideo, hasContent, generating]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveHeading(entry.target.id); }); },
      { root: container, rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    tocItems.forEach((item) => {
      const el = container.querySelector(`#${CSS.escape(item.id)}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems, renderedHtml]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasContent, currentLesson, lessonProgress, learningMode]);

  useEffect(() => {
    setLearningMode('text'); 
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
      setActiveHeading("");
    }
  }, [currentLessonId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={48} message="Loading classroom..." />
      </div>
    );
  }

  if (!course || allLessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <FileText className="text-gray-400" size={48} />
        <h2 className="text-2xl font-bold text-gray-900">Course Content Not Ready</h2>
        <p className="text-gray-600 max-w-md text-center">This course was generated but its lesson content is still being processed. Please check back shortly.</p>
        <Link href="/courses" className="text-orange-600 hover:underline font-semibold">Back to Courses</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <Link href={`/courses/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowLeft size={16} /> Back to Course
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth" ref={(el) => { contentRef.current = el; scrollContainerRef.current = el; }}>
          <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-3">
                {learningMode === 'video' ? 'Video Lesson' : 'Reading Material'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {currentLesson?.title || "Lesson Content"}
              </h1>
              
              {hasVideo && hasContent && (
                <div className="flex items-center gap-2 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setLearningMode('text')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      learningMode === 'text' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText size={16} /> Read Article
                  </button>
                  <button
                    onClick={() => setLearningMode('video')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      learningMode === 'video' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <PlayCircle size={16} /> Watch Video
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText size={14} /> Module {(currentLesson as any)?._moduleOrder || 1}
                </span>
                <span className="flex items-center gap-1">
                  <PlayCircle size={14} /> {currentLesson?.duration || "10 mins"}
                </span>
                {hasContent && learningMode === 'text' && !isCompleted && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <span className="text-xs font-medium">{Math.round(scrollProgress)}% read</span>
                  </span>
                )}
              </div>
            </div>

            {hasAnyContent ? (
              <>
                {learningMode === 'video' && hasVideo && youtubeId ? (
                  <div className="mb-8">
                    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-black" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                        title={currentLesson?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    {hasContent && (
                      <p className="text-sm text-gray-500 mt-4 text-center">
                        Prefer reading? Switch to the{' '}
                        <button onClick={() => setLearningMode('text')} className="text-orange-600 font-semibold hover:underline">
                          Article view
                        </button>.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {hasContent && tocItems.length > 0 && (
                      <div className="mb-8 bg-orange-50/50 border border-orange-100 rounded-xl overflow-hidden transition-all">
                        <button onClick={() => setTocOpen(!tocOpen)} className="w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <List size={18} className="text-orange-600" />
                            <h3 className="font-bold text-gray-900">In this lesson</h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-orange-100">{tocItems.length} sections</span>
                          </div>
                          {tocOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                        </button>
                        {tocOpen && (
                          <div className="px-4 pb-4 border-t border-orange-100">
                            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                              {tocItems.map((item) => (
                                <button key={item.id} onClick={() => scrollToHeading(item.id)} className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors truncate ${item.level === 1 ? "font-semibold" : item.level === 2 ? "pl-6 text-gray-600" : "pl-10 text-gray-500 text-xs"} ${activeHeading === item.id ? "bg-orange-100 text-orange-800 font-medium" : "hover:bg-white hover:text-orange-700"}`}>
                                  {item.text}
                                </button>
                              ))}
                            </nav>
                          </div>
                        )}
                      </div>
                    )}

                    {hasContent ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-8 shadow-sm prose prose-lg prose-orange max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 text-center text-gray-500">
                        <FileText size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>No written article available for this lesson. Please watch the video above.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-12 mb-8 text-center">
                <div className="max-w-md mx-auto">
                  {generating ? (
                    <>
                      <RefreshCw size={48} className="mx-auto mb-4 text-orange-500 animate-spin" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your Lesson...</h3>
                      <p className="text-gray-600 animate-pulse">Our AI tutor is crafting personalized content for &quot;{currentLesson?.title}&quot;. This typically takes 10–30 seconds.</p>
                    </>
                  ) : (
                    <>
                      <BookOpen size={48} className="mx-auto mb-4 text-orange-400" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Lesson Content</h3>
                      <p className="text-gray-600">Initializing AI generation pipeline...</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <button onClick={handlePrev} disabled={!prevLesson} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${prevLesson ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300" : "bg-gray-50 text-gray-300 cursor-not-allowed border border-transparent"}`}>
                <ChevronLeft size={20} /> Previous
              </button>

              {!enrolled ? (
                <button onClick={handleMarkCompleteAndNext} disabled={actionLoading} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${actionLoading ? "bg-gray-200 text-gray-500" : "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 hover:shadow-xl"}`}>
                  {actionLoading ? "Starting..." : "Start Learning"}
                </button>
              ) : canTakeExam && isLastLesson && isCompleted ? (
                <Link href={`/courses/${slug}/exam`} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <GraduationCap size={20} /> Take Final Exam <ChevronRight size={20} />
                </Link>
              ) : isLastLesson && isCompleted ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 size={20} /> Course Complete!
                </div>
              ) : (
                <button onClick={handleMarkCompleteAndNext} disabled={actionLoading || !currentLesson || generating} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${!actionLoading && !generating ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 hover:shadow-xl hover:-translate-y-0.5" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                  {actionLoading ? "Saving..." : isCompleted ? "Review Again" : "Mark Complete & Next"} <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className={`fixed inset-y-0 right-0 z-30 w-80 bg-white border-l border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full ${sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 mb-1 flex items-center justify-between">
              <span>Course Curriculum</span>
              {allLessonsCompleted && canTakeExam ? (
                <Link href={`/courses/${slug}/exam`} className="ml-2 text-xs inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-sm">
                  <GraduationCap size={12} /> Start Exam
                </Link>
              ) : null}
            </h3>
            <p className="text-xs text-gray-500">{allLessonsCompleted ? "Course complete" : `${displayProgressRounded}% Completed`}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${allLessonsCompleted ? "bg-green-500" : "bg-orange-500"}`} style={{ width: `${allLessonsCompleted ? 100 : displayProgress}%` }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {course.modules?.map((module: Module, modIdx) => (
              <div key={module.id || modIdx}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Module {module.order ?? modIdx + 1}: {module.title}</h4>
                <div className="space-y-1">
                  {module.lessons?.map((lesson: Lesson, lessIdx) => {
                    if (!lesson || (!lesson.id && !lesson.title)) return null;
                    const lessonId = lesson.id || `mod${modIdx}-les${lessIdx}-${(lesson.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                    const isActive = lessonId === currentLessonId;
                    const isLessonCompleted = isLessonMarkedCompleted(lesson);
                    const lessonPct = lessonProgress[lessonId] ?? 0;

                    return (
                      <button key={`${module.id ?? modIdx}-${lessonId}-${lessIdx}`} onClick={() => { setCurrentLessonId(lessonId); setScrollProgress(0); setSidebarOpen(false); }} className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${isActive ? "bg-orange-50 border border-orange-100" : "hover:bg-gray-50 border border-transparent"}`}>
                        <div className={`mt-0.5 ${isLessonCompleted ? "text-green-500" : isActive ? "text-orange-500" : "text-gray-300"}`}>
                          {isLessonCompleted ? <CheckCircle2 size={18} /> : <PlayCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? "text-orange-700" : "text-gray-700"}`}>{lesson.title || "Untitled Lesson"}</p>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-xs text-gray-400">{lesson.duration || "5 mins"}</p>
                            <div className="ml-2 text-xs text-gray-500 font-semibold">{Math.round(lessonPct)}%</div>
                          </div>
                          {isActive && !isLessonCompleted && scrollProgress > 0 && learningMode === 'text' && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-orange-400 h-1 rounded-full transition-all duration-300" style={{ width: `${scrollProgress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {canTakeExam && (
            <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-purple-600" />
                  <h4 className="text-sm font-bold text-purple-900">Final Exam Ready</h4>
                </div>
                <p className="text-xs text-purple-700 mb-3">You&apos;ve completed all lessons! Take the final exam to earn your certificate.</p>
                <Link href={`/courses/${slug}/exam`} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                  <GraduationCap size={14} /> Start Exam
                </Link>
              </div>
            </div>
          )}

          {!canTakeExam && (
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <h4 className="text-sm font-bold text-purple-900">AI Tutor Available</h4>
                </div>
                <p className="text-xs text-purple-700 mb-3">Stuck on a concept? Ask our AI assistant for a quick explanation.</p>
                <button className="w-full flex items-center justify-center gap-2 bg-white border border-purple-200 text-purple-700 py-2 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors">
                  <MessageSquare size={14} /> Ask a Question
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </main>
  );
}
