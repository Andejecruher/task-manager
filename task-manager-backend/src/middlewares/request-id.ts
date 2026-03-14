import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestHeaders = req.headers as Record<
    string,
    string | string[] | undefined
  >;
  const headerRequestId = requestHeaders["x-request-id"];
  const requestId =
    typeof headerRequestId === "string"
      ? headerRequestId
      : Array.isArray(headerRequestId)
        ? headerRequestId[0]
        : randomUUID();

  // Añadir al request
  req.requestId = requestId;

  // Añadir a la respuesta
  res.setHeader("X-Request-ID", requestId);

  next();
};
