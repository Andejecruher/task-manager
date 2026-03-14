import type { NextFunction, Request, Response } from "express";

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    details?: unknown;
  };
}

export const apiResponse = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Success response method
  res.apiSuccess = (data: unknown, message?: string, statusCode = 200) => {
    const response: ApiResponse = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || "",
      },
    };

    return res.status(statusCode).json(response);
  };

  // Error response method
  res.apiError = (error: string, statusCode = 500, details?: unknown) => {
    const response: ApiResponse = {
      success: false,
      error,
      message: error,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || "",
        details,
      },
    };

    return res.status(statusCode).json(response);
  };

  // Validation error response
  res.apiValidationError = (errors: unknown[]) => {
    const response: ApiResponse = {
      success: false,
      error: "Validation Error",
      message: "Los datos proporcionados son inválidos",
      data: { errors },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || "",
      },
    };

    return res.status(400).json(response);
  };

  next();
};
