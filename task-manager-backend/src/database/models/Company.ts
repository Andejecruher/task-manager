import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "../connection-sequelize";

// Atributos del modelo
interface CompanyAttributes {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo_url?: string;
  plan: string;
  billing_email?: string;
  subscription_id?: string;
  trial_ends_at?: Date;
  settings: object;
  features: object;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

// Atributos para creación (id opcional)
interface CompanyCreationAttributes extends Optional<
  CompanyAttributes,
  "id" | "settings" | "features" | "plan"
> {}

// Clase del modelo
class Company
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  declare id: string;
  declare name: string;
  declare slug: string;
  declare website?: string;
  declare logo_url?: string;
  declare plan: string;
  declare billing_email?: string;
  declare subscription_id?: string;
  declare trial_ends_at?: Date;
  declare settings: object;
  declare features: object;

  // Timestamps
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at?: Date | null;

  // Métodos personalizados
  async getActiveUsersCount(): Promise<number> {
    const { User } = require("./User");
    return await User.count({
      where: {
        company_id: this.id,
        is_active: true,
        deleted_at: null,
      },
    });
  }

  async getWorkspacesCount(): Promise<number> {
    const { Workspace } = require("./Workspace");
    return await Workspace.count({
      where: {
        company_id: this.id,
        deleted_at: null,
      },
    });
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// Inicializar modelo
Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // slug format
      },
    },
    website: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: true,
      },
    },
    logo_url: {
      type: DataTypes.TEXT,
      field: "logo_url",
    },
    plan: {
      type: DataTypes.STRING(50),
      defaultValue: "free",
      allowNull: false,
      validate: {
        isIn: [["free", "starter", "pro", "enterprise"]],
      },
    },
    billing_email: {
      type: DataTypes.STRING(255),
      field: "billing_email",
      validate: {
        isEmail: true,
      },
    },
    subscription_id: {
      type: DataTypes.STRING(255),
      field: "subscription_id",
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      field: "trial_ends_at",
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    created_at: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    deleted_at: {
      type: DataTypes.DATE,
      field: "deleted_at",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "Company",
    tableName: "companies",
    underscored: true,
    paranoid: true, // soft delete
    hooks: {
      beforeCreate: (company: Company) => {
        // Validaciones o transformaciones antes de crear
        console.log(`🏢 Iniciando creacion de Compañía: ${company.name}`);
      },
      afterCreate: (company: Company) => {
        // Logging, notificaciones, etc.
        console.log(`🏢 Compañía creada: ${company.name}`);
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["deleted_at"],
      },
      {
        fields: ["plan"],
      },
    ],
    defaultScope: {
      where: {
        deleted_at: null,
      },
      attributes: {
        exclude: ["subscription_id", "trial_ends_at"],
      },
    },
  },
);

// Configurar asociaciones
export function setupCompanyAssociations() {
  const { UserSession } = require("./UserSession");

  // Company tiene muchas UserSessions
  Company.hasMany(UserSession, {
    foreignKey: "company_id",
    as: "sessions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Company tiene muchos Users
  const { User } = require("./User");
  Company.hasMany(User, {
    foreignKey: "company_id",
    as: "users",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
}

export { Company, CompanyAttributes, CompanyCreationAttributes };
