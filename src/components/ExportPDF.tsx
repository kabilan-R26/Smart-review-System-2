import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileRecord, User } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportReview {
  subjectName: string;
  marks?: number;
  feedback?: string;
  status: string;
  date: string;
}

interface ExportPDFProps {
  student: Pick<User, "name" | "email" | "department" | "regNo" | "attendance">;
  reviews: ReportReview[];
  files?: Pick<FileRecord, "fileName" | "fileSize" | "uploadDate">[];
  facultyName?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function ExportPDF({
  student,
  reviews,
  files = [],
  facultyName,
  label = "Download PDF",
  className,
  variant = "default",
  size = "default",
}: ExportPDFProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const doc = new jsPDF() as JsPdfWithAutoTable;
      const averageMarks =
        reviews.filter((review) => typeof review.marks === "number").reduce((sum, review) => sum + (review.marks ?? 0), 0) /
        Math.max(reviews.filter((review) => typeof review.marks === "number").length, 1);

      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text("Student Report", 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`Student: ${student.name}`, 14, 32);
      doc.text(`Email: ${student.email}`, 14, 39);
      doc.text(`Department: ${student.department}`, 14, 46);
      doc.text(`Registration: ${student.regNo ?? "N/A"}`, 14, 53);
      doc.text(`Attendance: ${student.attendance ?? 0}%`, 14, 60);
      doc.text(`Faculty: ${facultyName ?? "Faculty Dashboard"}`, 14, 67);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 74);
      doc.text(
        `Average Marks: ${Number.isFinite(averageMarks) ? Math.round(averageMarks) : 0}/100`,
        14,
        81,
      );

      autoTable(doc, {
        startY: 90,
        head: [["Subject", "Marks", "Status", "Date", "Feedback"]],
        body:
          reviews.length > 0
            ? reviews.map((review) => [
                review.subjectName,
                review.marks != null ? `${review.marks}/100` : "Pending",
                review.status.replaceAll("_", " "),
                review.date,
                review.feedback?.trim() || "No feedback",
              ])
            : [["No reviews available", "-", "-", "-", "No faculty reviews were found for this student."]],
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [124, 58, 237],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      const filesStartY = (doc.lastAutoTable?.finalY ?? 100) + 12;

      autoTable(doc, {
        startY: filesStartY,
        head: [["Uploaded File", "Size", "Upload Date"]],
        body:
          files.length > 0
            ? files.map((file) => [file.fileName, file.fileSize, file.uploadDate])
            : [["No uploaded files", "-", "-"]],
        styles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [14, 116, 144],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      doc.save(`${safeFileName(student.name)}_report.pdf`);
      toast.success("PDF report downloaded.");
    } catch {
      toast.error("Unable to generate the PDF report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={loading}
      onClick={handleExport}
      className={className}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {loading ? "Generating..." : label}
    </Button>
  );
}

export default ExportPDF;
