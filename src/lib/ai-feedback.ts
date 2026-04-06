export interface AIFeedbackRequest {
  submissionText: string;
  studentName: string;
  subjectName: string;
  marks?: number;
}

export interface AIFeedbackResult {
  feedback: string;
  source: "api" | "fallback";
}

function buildFallbackFeedback({ submissionText, studentName, subjectName, marks }: AIFeedbackRequest) {
  const normalizedText = submissionText.toLowerCase();
  const feedbackParts: string[] = [];

  if ((marks ?? 0) >= 85) {
    feedbackParts.push("Strong academic foundation and confident subject understanding.");
  } else if ((marks ?? 0) >= 70) {
    feedbackParts.push("Solid structure with a good grasp of the core concepts.");
  } else {
    feedbackParts.push("The submission shows effort, but the core explanation still needs refinement.");
  }

  if (normalizedText.includes("report") || normalizedText.includes("document")) {
    feedbackParts.push("Tighten the written flow by connecting each section more clearly to the final conclusion.");
  } else if (normalizedText.includes("presentation") || normalizedText.includes("slide")) {
    feedbackParts.push("Make the presentation more persuasive by adding sharper transitions and cleaner takeaways.");
  } else {
    feedbackParts.push("Add one or two concrete examples to make the explanation easier to evaluate.");
  }

  if (normalizedText.includes("machine learning") || normalizedText.includes("model")) {
    feedbackParts.push("Include practical use cases and briefly justify why the chosen approach fits the problem.");
  } else if (normalizedText.includes("database") || normalizedText.includes("dbms")) {
    feedbackParts.push("Strengthen the design discussion with normalization choices and real query reasoning.");
  } else if (normalizedText.includes("lsm")) {
    feedbackParts.push("Push the business clarity further by sharpening the problem statement and customer value.");
  } else {
    feedbackParts.push("Improve the conclusion by summarizing the key outcome and the next technical step.");
  }

  feedbackParts.push(`${studentName} should revise the ${subjectName} submission with more clarity, stronger examples, and a sharper closing summary.`);

  return feedbackParts.join(" ");
}

export async function generateAIFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResult> {
  const apiUrl = import.meta.env.VITE_AI_FEEDBACK_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data = await response.json();
        const feedback = data.feedback ?? data.output_text ?? data.text;

        if (typeof feedback === "string" && feedback.trim()) {
          return { feedback: feedback.trim(), source: "api" };
        }
      }
    } catch {
      // Fall through to the local generator so the UI always remains usable.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    feedback: buildFallbackFeedback(request),
    source: "fallback",
  };
}
