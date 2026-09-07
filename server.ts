import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Ensure uploads directory exists inside public/
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Image Upload API to save image to workspace files for Git persistence
  app.post("/api/upload-image", (req, res) => {
    try {
      const { base64Data, fileName, subDir } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data" });
      }

      let buffer: Buffer;
      let ext = "jpg";

      const match = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        ext = match[1] === "jpeg" ? "jpg" : match[1];
        buffer = Buffer.from(match[2], "base64");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }

      const safeName = fileName 
        ? fileName.replace(/[^a-zA-Z0-9_-]/g, "_") 
        : `advocate_image_${Date.now()}`;
      
      const targetSubDir = subDir ? subDir : "";
      const targetFolder = path.join(uploadsDir, targetSubDir);
      
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const finalFileName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;
      const targetFilePath = path.join(targetFolder, finalFileName);

      fs.writeFileSync(targetFilePath, buffer);

      // Also copy to src/assets/images if present
      const srcAssetsDir = path.join(process.cwd(), "src", "assets", "images");
      if (fs.existsSync(srcAssetsDir)) {
        try {
          fs.writeFileSync(path.join(srcAssetsDir, finalFileName), buffer);
        } catch {
          // Ignore if copy to assets fails
        }
      }

      const relativeUrl = targetSubDir 
        ? `/uploads/${targetSubDir}/${finalFileName}` 
        : `/uploads/${finalFileName}`;

      console.log(`[Upload API] Image saved to disk: ${targetFilePath}`);

      return res.json({
        success: true,
        filePath: targetFilePath,
        url: relativeUrl,
        fileName: finalFileName
      });
    } catch (err: any) {
      console.error("[Upload API] Failed to write image file:", err);
      return res.status(500).json({ error: err.message || "Failed to save image file" });
    }
  });

  // Serve static uploads
  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware in development or static fallback in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
