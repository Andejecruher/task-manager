import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import {
  getTokenManagerScript,
  swaggerCustomization,
} from "@/config/swagger-token-manager";
import { apiResponse } from "@/middlewares/api-response";
import { errorHandler } from "@/middlewares/error";
import { requestId } from "@/middlewares/request-id";
import router from "@/routes";
import { logger } from "@/utils/logger";

// Configuración de Swagger con Token Manager
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "API para sistema de gestión de tareas multi-tenant",
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token obtenido del login o register. Se captura automáticamente y se guarda en localStorage.",
        },
      },
    },
  },
  apis: ["./src/docs/routes/*.swagger.ts"],
};

const swaggerSpec = swaggerJsdoc(
  swaggerOptions as Parameters<typeof swaggerJsdoc>[0],
);

// ===================================
// Swagger UI Customization
// ===================================

const tokenManagerScript = getTokenManagerScript();
const swaggerUiOptions = {
  swaggerOptions: {
    // Auto-load token si existe
    persistAuthorization: true,
    defaultModelsExpandDepth: 1,
  },
  customCss: swaggerCustomization.css,
  customSiteTitle: swaggerCustomization.siteTitle,
  // Inyectar script de token manager
  customJs: tokenManagerScript,
};

// Crear aplicación Express
export const app = express();

// ====================
// MIDDLEWARES GLOBALES
// ====================

// 1. Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// 2. CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  message: "Demasiadas solicitudes desde esta IP",
  standardHeaders: true,
  legacyHeaders: false,
});
// Aplicar rate limiting a todas las rutas de la API
app.use("/api/", limiter);

// 4. Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 5. Compression
app.use(compression());

// 6. Logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

// 7. Custom middlewares
app.use(requestId);
app.use(apiResponse);

// ====================
// RUTAS
// ====================

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
  res.apiSuccess({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// // API Routes
app.use("/api/v1", router);

// Swagger documentation with Token Manager
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions),
);

// 404 handler
app.use("*", (_, res: Response) => {
  res.status(404).apiError("Ruta no encontrada", 404);
});

// Global error handler
app.use(errorHandler);

export default app;
