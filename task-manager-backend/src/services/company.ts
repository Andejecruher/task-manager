import { Company } from "@/database/models/Company";
import { User } from "@/database/models/User";

class CompanyService {
  async getCompaniesForEmail(email: string) {
    // Buscar usuarios por email e incluir su compañía
    const users = await User.findAll({
      where: { email },
      include: [
        {
          model: Company as any,
          as: "company",
          attributes: ["id", "name", "slug", "plan", "created_at"],
          required: true,
        },
      ],
      attributes: ["role"],
    });

    const mapped = users
      .map((u: any) => ({
        id: u.company.id,
        name: u.company.name,
        slug: u.company.slug,
        plan: u.company.plan,
        user_role: u.role,
        created_at: u.company.created_at,
      }))
      .sort((a: any, b: any) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      });

    return mapped;
  }

  async getUserCompanyBySlug(email: string, slug: string) {
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Company as any,
          as: "company",
          where: { slug },
          attributes: ["id", "name", "slug", "plan"],
          required: true,
        },
      ],
      attributes: ["id", "role", "company_id"],
    });

    if (!user) return null;

    const company = (user as any).company;

    return {
      user_id: user.id,
      company_id: company.id,
      role: user.role,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        plan: company.plan,
      },
    };
  }
}

export const companyService = new CompanyService();
