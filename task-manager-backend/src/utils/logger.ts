import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import type TransportStream from "winston-transport";

const logDir = "logs";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const renderedTimestamp =
      typeof timestamp === "string" ? timestamp : String(timestamp);
    const renderedMessage =
      typeof message === "string" ? message : JSON.stringify(message);
    const renderedStack = typeof stack === "string" ? stack : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    const stackStr = renderedStack ? `\n${renderedStack}` : "";
    return `[${renderedTimestamp}] ${level.toUpperCase()}: ${renderedMessage}${metaStr}${stackStr}`;
  }),
);

// Configuración por entorno
const getTransports = () => {
  const transports: TransportStream[] = [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ];

  if (process.env.NODE_ENV !== "test") {
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, "application-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        format: logFormat,
      }),
      new DailyRotateFile({
        filename: path.join(logDir, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
        format: logFormat,
      }),
    );
  }

  return transports;
};

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "task-manager-api" },
  transports: getTransports(),
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
});

// Stream para Morgan (HTTP logging)
export const httpLoggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
