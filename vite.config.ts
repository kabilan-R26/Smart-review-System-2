import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
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

function sendJson(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function localUploadPlugin() {
  return {
    name: "local-upload-endpoint",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use("/api/upload", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const uploadRequest = new Request("http://localhost/api/upload", {
            method: "POST",
            headers: req.headers as RequestInit["headers"],
            body: Readable.toWeb(req) as RequestInit["body"],
            duplex: "half",
          } as RequestInit & { duplex: "half" });

          const formData = await uploadRequest.formData();
          const file = formData.get("file");

          if (
            !file ||
            typeof file === "string" ||
            typeof file.arrayBuffer !== "function" ||
            typeof file.name !== "string"
          ) {
            sendJson(res, 400, { error: "No file provided" });
            return;
          }

          const extension = getExtension(file.name);
          if (!ALLOWED_UPLOAD_EXTENSIONS.has(extension) && !ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
            sendJson(res, 415, { error: "Only PDF, PPT, and DOC files are allowed" });
            return;
          }

          const uploadDir = path.resolve(__dirname, "public", "uploads");
          await mkdir(uploadDir, { recursive: true });

          const id = `upload_${randomUUID()}`;
          const storedFileName = `${Date.now()}-${id}-${sanitizeFileName(file.name)}`;
          const storedPath = path.join(uploadDir, storedFileName);

          await writeFile(storedPath, Buffer.from(await file.arrayBuffer()));

          sendJson(res, 200, {
            id,
            fileUrl: `/uploads/${storedFileName}`,
            url: `/uploads/${storedFileName}`,
            originalName: file.name,
            size: file.size,
            type: file.type,
          });
        } catch {
          sendJson(res, 500, { error: "Upload failed on the local dev server" });
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
  plugins: [localUploadPlugin(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
