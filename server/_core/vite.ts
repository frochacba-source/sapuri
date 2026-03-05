import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Use process.cwd() for more reliable path resolution in production
  const distPath = path.resolve(process.cwd(), "dist", "public");
  const assetsPath = path.resolve(distPath, "assets");
  
  console.log(`[Static] CWD: ${process.cwd()}`);
  console.log(`[Static] Serving static files from: ${distPath}`);
  console.log(`[Static] Directory exists: ${fs.existsSync(distPath)}`);
  console.log(`[Static] Assets directory exists: ${fs.existsSync(assetsPath)}`);
  
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath).slice(0, 5);
    console.log(`[Static] Sample assets: ${files.join(', ')}`);
  }
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve static files with proper MIME types and extensions
  app.use(express.static(distPath, {
    index: false, // Don't serve index.html for directories
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      } else if (filePath.endsWith('.woff')) {
        res.setHeader('Content-Type', 'font/woff');
      }
    }
  }));

  // SPA fallback - only for HTML requests (not assets)
  app.use("*", (req, res, next) => {
    // Skip if request is for a file with an extension (asset)
    const url = req.originalUrl;
    if (url.includes('.') && !url.endsWith('.html')) {
      // This is a request for an asset that wasn't found
      return res.status(404).send('Not found');
    }
    // Otherwise serve index.html for SPA routing
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
