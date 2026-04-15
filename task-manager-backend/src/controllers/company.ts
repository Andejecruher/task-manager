import { companyService } from "@/services/company";
import { sessionService } from "@/services/session";
import { tokenService } from "@/services/token";
import { UserRole, type AuthRequest } from "@/types";
import type { Request, Response } from "express";

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  user_role: string;
  created_at: string;
}

interface UserCompanyInfo {
  user_id: string;
  company_id: string;
  role: string;
  company: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

class CompanyControllerClass {
  async listCompanies(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as unknown as AuthRequest;

      const companies = (await companyService.getCompaniesForEmail(
        authReq.user.email,
      )) as CompanyInfo[];

      return res.apiSuccess(companies, "Compañías obtenidas");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error obteniendo compañías:", error);
      return res.status(500).apiError("Error obteniendo compañías");
    }
  }

  async switchCompany(req: Request, res: Response): Promise<Response> {
    try {
      const { companySlug } = req.params;

      const authReq = req as unknown as AuthRequest;

      const membership = (await companyService.getUserCompanyBySlug(
        authReq.user.email,
        companySlug,
      )) as UserCompanyInfo | null;

      if (!membership) {
        return res.status(403).apiError(
          "No perteneces a esta compañía",
          403,
          { code: "NOT_COMPANY_MEMBER" },
        );
      }

      const { user_id, company_id, role, company } = membership;

      const deviceInfo = req.deviceInfo || {};

      const { sessionId, refreshToken } = await sessionService.createSession(
        user_id,
        company_id,
        deviceInfo,
        req.ip,
      );

      const { token: accessToken, expiresIn } = tokenService.generateAccessToken(
        {
          userId: user_id,
          companyId: company_id,
          sessionId,
          role: UserRole[role as keyof typeof UserRole],
          email: authReq.user.email,
        },
      );

      return res.apiSuccess(
        {
          user: {
            id: user_id,
            email: authReq.user.email,
            role,
            companyId: company_id,
          },
          company,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn,
            refreshExpiresIn: 604800,
          },
        },
        "Compañía cambiada exitosamente",
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error cambiando de compañía:", error);
      return res.status(500).apiError("Error cambiando de compañía");
    }
  }

  validateSlug(req: Request, res: Response): Response {
    try {
      const { companySlug } = req.params;

      const authReq = req as AuthRequest;

      const userInfo = {
        user: authReq.user,
        company: authReq.company,
        sessionId: authReq.sessionId,
      };

      if (!userInfo.user || !userInfo.sessionId) {
        return res.status(401).apiError("No autenticado");
      }

      const company = userInfo.company;

      if (company?.slug === companySlug) {
        return res.apiSuccess(
          { exists: true },
          "Validación de slug completada",
        );
      }

      return res.apiError(
        "Slug no válido",
        404,
        { code: "INVALID_COMPANY_SLUG" },
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error validando slug:", error);
      return res.status(500).apiError("Error validando slug");
    }
  }
}

export const CompanyController = new CompanyControllerClass();
