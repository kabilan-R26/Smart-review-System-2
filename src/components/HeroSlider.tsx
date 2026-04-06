import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
}

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);

  const totalSlides = slides.length;

  const goToSlide = (nextIndex: number) => {
    if (totalSlides === 0) return;

    const wrappedIndex = (nextIndex + totalSlides) % totalSlides;
    const nextDirection = wrappedIndex === current ? 0 : wrappedIndex > current ? 1 : -1;
    setCurrent([wrappedIndex, nextDirection]);
  };

  const paginate = useCallback((nextDirection: number) => {
    if (totalSlides <= 1) return;
    setCurrent(([previous]) => [
      (previous + nextDirection + totalSlides) % totalSlides,
      nextDirection,
    ]);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [paginate, totalSlides]);

  const activeSlide = useMemo(() => slides[current], [current, slides]);

  if (!activeSlide) return null;

  return (
    <div className="group relative mb-8 flex h-[320px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#020617] shadow-2xl md:h-[380px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#020617]" />
      <div className="absolute left-[-5%] top-[-10%] h-72 w-72 rounded-full bg-cyan-500/20 blur-[90px]" />
      <div className="absolute bottom-[-15%] right-[-2%] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[110px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_22%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 hidden items-center justify-between px-4 sm:flex">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => paginate(-1)}
          className="pointer-events-auto inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => paginate(1)}
          className="pointer-events-auto inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      <div className="relative z-20 flex h-full w-full items-center overflow-hidden">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 80 : -80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction >= 0 ? -80 : 80, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div className="grid h-full w-full items-center gap-10 px-8 pb-16 pt-10 md:grid-cols-[1.2fr_0.8fr] md:px-16 lg:px-24">
              <div className="flex flex-col items-start justify-center text-left">
                {activeSlide.icon && (
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white shadow-[0_20px_40px_rgba(15,23,42,0.28)] backdrop-blur-md">
                    {activeSlide.icon}
                  </div>
                )}

                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
                  {activeSlide.title}
                </h1>

                <p className="mt-4 max-w-2xl text-base font-medium text-slate-200/95 md:text-xl">
                  {activeSlide.subtitle}
                </p>

                {activeSlide.ctaText && (
                  <Button
                    onClick={activeSlide.onCtaClick}
                    className="mt-8 h-12 cursor-pointer rounded-full bg-white px-7 text-base font-bold text-indigo-900 shadow-[0_20px_40px_rgba(255,255,255,0.18)] transition hover:bg-slate-100 active:scale-95"
                  >
                    {activeSlide.ctaText}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="hidden h-full items-center justify-end md:flex">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.12, duration: 0.5, ease: "easeOut" }}
                  className="relative flex h-[230px] w-full max-w-[320px] items-center justify-center rounded-[30px] border border-white/15 bg-white/10 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-md"
                >
                  <div className="absolute inset-4 rounded-[24px] border border-white/10" />
                  <div className="absolute left-6 top-6 h-3 w-3 rounded-full bg-emerald-400" />
                  <div className="absolute right-6 top-6 h-3 w-16 rounded-full bg-white/20" />
                  <div className="relative z-10 space-y-4 text-left">
                    <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                      Faculty Insights
                    </div>
                    <div className="text-3xl font-bold">{String(current + 1).padStart(2, "0")}</div>
                    <div className="h-2 w-28 rounded-full bg-white/20" />
                    <div className="h-2 w-20 rounded-full bg-white/15" />
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100/90">
                      Fast navigation, clear calls to action, and motion that keeps the content readable.
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-6 z-30 flex gap-3 sm:hidden">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => paginate(-1)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => paginate(1)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
