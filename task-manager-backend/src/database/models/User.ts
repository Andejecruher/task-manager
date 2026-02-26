import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface UserAttributes {
  id: string;
  company_id: string;
  email: string;
  email_verified: boolean;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login_at?: Date;
  failed_login_attempts: number;
  locked_until?: Date;
  role: string;
  permissions: string[];
  is_active: boolean;
  is_onboarded: boolean;
  gdpr_consent_at?: Date;
  data_retention_until?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  | "id"
  | "email_verified"
  | "mfa_enabled"
  | "failed_login_attempts"
  | "permissions"
  | "is_active"
  | "is_onboarded"
  | "timezone"
  | "locale"
> { }

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public company_id!: string;
  public email!: string;
  public email_verified!: boolean;
  public password_hash!: string;
  public full_name?: string;
  public avatar_url?: string;
  public phone?: string;
  public timezone!: string;
  public locale!: string;
  public mfa_enabled!: boolean;
  public mfa_secret?: string;
  public last_login_at?: Date;
  public failed_login_attempts!: number;
  public locked_until?: Date;
  public role!: string;
  public permissions!: string[];
  public is_active!: boolean;
  public is_onboarded!: boolean;
  public gdpr_consent_at?: Date;
  public data_retention_until?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date | null;

  // Métodos de asociación (generados por Sequelize)
  // public getWorkspaces!: BelongsToManyGetAssociationsMixin<Workspace>;
  // public getCreatedTasks!: HasManyGetAssociationsMixin<Task>;
  // public getAssignedTasks!: HasManyGetAssociationsMixin<Task>;

  // Propiedades de asociación
  // public readonly workspaces?: Workspace[];
  // public readonly createdTasks?: Task[];
  // public readonly assignedTasks?: Task[];

  // Métodos personalizados
  async isLocked(): Promise<boolean> {
    return this.locked_until ? this.locked_until > new Date() : false;
  }

  async incrementFailedAttempts(): Promise<void> {
    this.failed_login_attempts += 1;

    if (this.failed_login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 15 * 60000); // 15 minutos
    }

    await this.save();
  }

  async resetFailedAttempts(): Promise<void> {
    this.failed_login_attempts = 0;
    this.locked_until = undefined;
    await this.save();
  }

  async hasPermission(permission: string): Promise<boolean> {
    return (
      this.permissions.includes(permission) ||
      ["owner", "admin"].includes(this.role)
    );
  }

  // async getActiveSessionsCount(): Promise<number> {
  //     const { UserSession } = require('./UserSession.model');
  //     return await UserSession.count({
  //         where: {
  //             userId: this.id,
  //             isActive: true,
  //             expiresAt: { [Op.gt]: new Date() }
  //         }
  //     });
  // }

  toJSON() {
    const { password_hash, mfa_secret, ...sanitizedValues } = this.get({
      plain: true,
    }) as UserAttributes;
    return sanitizedValues;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "company_id",
      references: {
        model: "companies",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "email_verified",
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    full_name: {
      type: DataTypes.STRING(255),
      field: "full_name",
    },
    avatar_url: {
      type: DataTypes.TEXT,
      field: "avatar_url",
    },
    phone: {
      type: DataTypes.STRING(50),
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: "UTC",
    },
    locale: {
      type: DataTypes.STRING(10),
      defaultValue: "es-ES",
    },
    mfa_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "mfa_enabled",
    },
    mfa_secret: {
      type: DataTypes.STRING(255),
      field: "mfa_secret",
    },
    last_login_at: {
      type: DataTypes.DATE,
      field: "last_login_at",
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "failed_login_attempts",
    },
    locked_until: {
      type: DataTypes.DATE,
      field: "locked_until",
    },
    role: {
      type: DataTypes.ENUM("owner", "admin", "manager", "member", "viewer"),
      defaultValue: "member",
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    is_onboarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_onboarded",
    },
    gdpr_consent_at: {
      type: DataTypes.DATE,
      field: "gdpr_consent_at",
    },
    data_retention_until: {
      type: DataTypes.DATE,
      field: "data_retention_until",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "User",
    tableName: "users",
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["company_id", "email"],
      },
      {
        fields: ["email"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["is_active"],
      },
    ],
    defaultScope: {
      attributes: {
        exclude: [
          "password_hash",
          "mfa_secret",
          "mfa_enabled",
          "failed_login_attempts",
          "locked_until",
          "last_login_at",
          "gdpr_consent_at",
          "data_retention_until",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
      },
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ["password_hash"],
        },
      },
      active: {
        where: {
          is_active: true,
        },
      },
      owners: {
        where: {
          role: "owner",
        },
      },
    },
  },
);

// Configurar asociaciones
export function setupUserAssociations() {
  const { UserSession } = require("./UserSession");

  // User tiene muchas UserSessions
  User.hasMany(UserSession, {
    foreignKey: "user_id",
    as: "sessions",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
}

export { User, UserAttributes, UserCreationAttributes };
