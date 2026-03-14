import type { DeviceInfo } from "@/types";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
    deviceInfo?: DeviceInfo;
  }

  interface Response {
    apiSuccess: (
      data: unknown,
      message?: string,
      statusCode?: number,
    ) => Response;
    apiError: (
      error: string,
      statusCode?: number,
      details?: unknown,
    ) => Response;
    apiValidationError: (errors: unknown[]) => Response;
  }
}

export {};
