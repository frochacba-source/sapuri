import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerTelegramWebhook } from "./botWebhook";
import { initializeBotHealthCheck } from "./botHealthCheck";
import { startAutoSave } from "../autoSave";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Telegram webhook
  registerTelegramWebhook(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "5000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicializar health check do bot Telegram
    try {
      await initializeBotHealthCheck();
      console.log('[Telegram] ✅ Health check inicializado com sucesso!');
    } catch (error) {
      console.log('[Telegram] ℹ️ Bot Telegram não configurado');
    }
    
    // Iniciar sistema de salvamento automático a cada 5 minutos
    try {
      startAutoSave(5);
    } catch (e) {
      console.warn('[AutoSave] Sistema de salvamento automático não disponível');
    }
    
    // Iniciar sistema de backup automático
    try {
      const backupModule = await import('../backup.ts');
      backupModule.scheduleBackups();
    } catch (e) {
      console.warn('[Backup] Sistema de backup não disponível');
    }
    
    // WhatsApp DESATIVADO - não funcional
    console.log('[WhatsApp] ℹ️ Integração WhatsApp desativada');
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] Recebido SIGTERM, encerrando...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] Recebido SIGINT, encerrando...");
  process.exit(0);
});
