import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { componentTagger } from "lovable-tagger";

const ALLOWED_UPLOAD_EXTENSIONS = new Set(["pdf", "ppt", "pptx", "doc", "docx"]);
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function uploadMiddleware() {
  return {
    name: "local-upload-middleware",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use("/upload", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const request = new Request("http://localhost/upload", {
            method: "POST",
            headers: req.headers as HeadersInit,
            body: req,
            duplex: "half",
          } as RequestInit & { duplex: "half" });
          const formData = await request.formData();
          const uploadedFile = formData.get("file");

          if (!(uploadedFile instanceof File)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "No file was provided." }));
            return;
          }

          const extension = getExtension(uploadedFile.name);
          const isAllowedType =
            ALLOWED_UPLOAD_EXTENSIONS.has(extension) || ALLOWED_UPLOAD_MIME_TYPES.has(uploadedFile.type);

          if (!isAllowedType) {
            res.statusCode = 415;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Only PDF, PPT, and DOC files are supported." }));
            return;
          }

          const safeFileName = sanitizeFileName(uploadedFile.name);
          const storedFileName = `${Date.now()}-${randomUUID()}-${safeFileName}`;
          const uploadDirectory = path.resolve(__dirname, "public", "uploads");
          await mkdir(uploadDirectory, { recursive: true });
          const buffer = Buffer.from(await uploadedFile.arrayBuffer());
          await writeFile(path.join(uploadDirectory, storedFileName), buffer);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              id: `upload_${randomUUID()}`,
              fileUrl: `/uploads/${storedFileName}`,
              url: `/uploads/${storedFileName}`,
              originalName: uploadedFile.name,
              size: uploadedFile.size,
              type: uploadedFile.type,
            }),
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed.";
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  plugins: [react(), uploadMiddleware(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
