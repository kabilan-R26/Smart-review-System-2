import { useEffect, useState } from "react";
import { Bot, RefreshCw, Sparkles } from "lucide-react";
import { generateAIFeedback } from "@/lib/ai-feedback";
import { LoadingSpinner } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";

interface AIFeedbackProps {
  contextKey: string;
  submissionText: string;
  studentName: string;
  subjectName: string;
  marks?: number;
  onApplyFeedback?: (feedback: string) => void;
}

export function AIFeedback({
  contextKey,
  submissionText,
  studentName,
  subjectName,
  marks,
  onApplyFeedback,
}: AIFeedbackProps) {
  const [generatedFeedback, setGeneratedFeedback] = useState("");
  const [feedbackSource, setFeedbackSource] = useState<"api" | "fallback" | null>(null);
  const [isGenerating, setGenerating] = useState(false);

  useEffect(() => {
    setGeneratedFeedback("");
    setFeedbackSource(null);
    setGenerating(false);
  }, [contextKey]);

  const handleGenerate = async () => {
    setGenerating(true);

    const result = await generateAIFeedback({
      submissionText,
      studentName,
      subjectName,
      marks,
    });

    setGeneratedFeedback(result.feedback);
    setFeedbackSource(result.source);
    setGenerating(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Feedback Assistant</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Generate structured feedback with API support when configured, or a reliable local fallback when it is not.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="cursor-pointer rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4 border-white/90 border-t-transparent" />
              Generating...
            </>
          ) : generatedFeedback ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Feedback
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        {isGenerating ? (
          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <LoadingSpinner className="h-5 w-5" />
            Building feedback suggestions for this submission...
          </div>
        ) : generatedFeedback ? (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{generatedFeedback}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Source: {feedbackSource === "api" ? "Configured API" : "Local fallback generator"}
              </span>
              {onApplyFeedback && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onApplyFeedback(generatedFeedback)}
                  className="cursor-pointer rounded-xl border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Use Feedback
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No AI feedback yet. Generate a suggestion to speed up your review workflow.
          </p>
        )}
      </div>
    </div>
  );
}
