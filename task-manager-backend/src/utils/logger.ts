import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import type TransportStream from "winston-transport";

const logDir = "logs";

const isTruthy = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  const normalizedValue = value.toLowerCase().trim();
  return (
    normalizedValue === "1" ||
    normalizedValue === "true" ||
    normalizedValue === "yes" ||
    normalizedValue === "on"
  );
};

const canWriteToLogDirectory = (): boolean => {
  try {
    fs.accessSync(logDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

const shouldUseFileLogging = (): boolean => {
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  if (!isTruthy(process.env.LOG_TO_FILE)) {
    return false;
  }

  return canWriteToLogDirectory();
};

const fileLoggingEnabled = shouldUseFileLogging();

if (isTruthy(process.env.LOG_TO_FILE) && !fileLoggingEnabled) {
  // eslint-disable-next-line no-console
  console.warn(
    `LOG_TO_FILE está habilitado pero el directorio '${logDir}' no es escribible. Se usarán logs por consola.`,
  );
}

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

  if (fileLoggingEnabled) {
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
  exceptionHandlers: fileLoggingEnabled
    ? [
        new winston.transports.File({
          filename: path.join(logDir, "exceptions.log"),
        }),
      ]
    : [new winston.transports.Console()],
  rejectionHandlers: fileLoggingEnabled
    ? [
        new winston.transports.File({
          filename: path.join(logDir, "rejections.log"),
        }),
      ]
    : [new winston.transports.Console()],
});

// Stream para Morgan (HTTP logging)
export const httpLoggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
