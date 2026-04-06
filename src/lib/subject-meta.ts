import type { Subject } from "@/contexts/AuthContext";
import { BookOpen, Brain, Cpu, Database, Rocket, type LucideIcon } from "lucide-react";

interface SubjectVisualConfig {
  icon: LucideIcon;
  gradientClass: string;
  glowClass: string;
  slug: string;
}

const DEFAULT_SUBJECT_CONFIG: SubjectVisualConfig = {
  icon: BookOpen,
  gradientClass: "from-slate-700 via-slate-800 to-slate-900",
  glowClass: "bg-slate-500/35",
  slug: "subject",
};

function normalizeSubjectName(subjectName: string) {
  return subjectName.trim().toLowerCase();
}

export function getSubjectVisualConfig(subjectName: string): SubjectVisualConfig {
  const normalized = normalizeSubjectName(subjectName);

  if (normalized.includes("data struct") || normalized.includes("dsa")) {
    return {
      icon: Cpu,
      gradientClass: "from-sky-500 via-cyan-500 to-blue-600",
      glowClass: "bg-cyan-400/40",
      slug: "data-structures",
    };
  }

  if (
    normalized.includes("database management systems") ||
    normalized.includes("dbms") ||
    normalized.includes("database")
  ) {
    return {
      icon: Database,
      gradientClass: "from-emerald-500 via-teal-500 to-cyan-600",
      glowClass: "bg-emerald-400/40",
      slug: "dbms",
    };
  }

  if (normalized.includes("machine learning") || normalized.includes("ml")) {
    return {
      icon: Brain,
      gradientClass: "from-violet-500 via-fuchsia-500 to-indigo-600",
      glowClass: "bg-fuchsia-400/40",
      slug: "machine-learning",
    };
  }

  if (normalized.includes("lsm") || normalized.includes("lean startup management")) {
    return {
      icon: Rocket,
      gradientClass: "from-amber-500 via-orange-500 to-rose-500",
      glowClass: "bg-orange-400/40",
      slug: "lsm",
    };
  }

  return {
    ...DEFAULT_SUBJECT_CONFIG,
    slug: slugifySubjectName(subjectName),
  };
}

export function slugifySubjectName(subjectName: string) {
  return (
    normalizeSubjectName(subjectName)
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || DEFAULT_SUBJECT_CONFIG.slug
  );
}

export function getSubjectPath(subjectName: string) {
  return `/subject/${getSubjectVisualConfig(subjectName).slug}`;
}

export function findSubjectBySlug(subjects: Subject[], subjectSlug?: string | null) {
  if (!subjectSlug) return null;
  return (
    subjects.find((subject) => getSubjectVisualConfig(subject.name).slug === subjectSlug) ?? null
  );
}
