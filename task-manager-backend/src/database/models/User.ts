import { sequelizeConnection } from '@/database/connection-sequelize';
import {
  BelongsToManyGetAssociationsMixin,
  DataTypes,
  HasManyGetAssociationsMixin,
  Model,
  Op,
  Optional
} from 'sequelize';

interface UserAttributes {
  id: string;
  company_id: string;
  email: string;
  email_verified: boolean;
  password_hash?: string;
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
  deleted_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes,
  'id' | 'email_verified' | 'mfa_enabled' | 'failed_login_attempts' |
  'permissions' | 'is_active' | 'is_onboarded' | 'timezone' | 'locale'
> { }

class User extends Model<UserAttributes, UserCreationAttributes>
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
  public readonly deleted_at?: Date;

  // Métodos de asociación (generados por Sequelize)
  public getWorkspaces!: BelongsToManyGetAssociationsMixin<any>;
  public getCreatedTasks!: HasManyGetAssociationsMixin<any>;
  public getAssignedTasks!: HasManyGetAssociationsMixin<any>;

  // Propiedades de asociación
  public readonly workspaces?: any[];
  public readonly created_tasks?: any[];
  public readonly assigned_tasks?: any[];
  public readonly company?: any;

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
    return this.permissions.includes(permission) ||
      ['owner', 'admin'].includes(this.role);
  }

  async getActiveSessionsCount(): Promise<number> {
    const { UserSession } = require('./UserSession.model');
    return await UserSession.count({
      where: {
        user_id: this.id,
        is_active: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.mfa_secret;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'company_id',
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'email',
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    full_name: {
      type: DataTypes.STRING(255),
      field: 'full_name'
    },
    avatar_url: {
      type: DataTypes.TEXT,
      field: 'avatar_url'
    },
    phone: {
      type: DataTypes.STRING(50),
      field: 'phone'
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'UTC',
      field: 'timezone'
    },
    locale: {
      type: DataTypes.STRING(10),
      defaultValue: 'es-ES',
      field: 'locale'
    },
    mfa_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'mfa_enabled'
    },
    mfa_secret: {
      type: DataTypes.STRING(255),
      field: 'mfa_secret'
    },
    last_login_at: {
      type: DataTypes.DATE,
      field: 'last_login_at'
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failed_login_attempts'
    },
    locked_until: {
      type: DataTypes.DATE,
      field: 'locked_until'
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'member',
      allowNull: false,
      field: 'role',
      validate: {
        isIn: [['owner', 'admin', 'manager', 'member', 'viewer']]
      }
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'permissions'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    is_onboarded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_onboarded'
    },
    gdpr_consent_at: {
      type: DataTypes.DATE,
      field: 'gdpr_consent_at'
    },
    data_retention_until: {
      type: DataTypes.DATE,
      field: 'data_retention_until'
    }
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['company_id', 'email']
      },
      {
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ],
    defaultScope: {
      where: {
        deleted_at: undefined
      },
      attributes: {
        exclude: ['password_hash', 'mfa_secret']
      }
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ['password_hash']
        }
      },
      active: {
        where: {
          is_active: true,
          deleted_at: undefined
        }
      },
      owners: {
        where: {
          role: 'owner'
        }
      }
    }
  }
);

export function setupUserAssociations() {
  const Company = require('./Company').Company;
  const Workspace = require('./Workspace').Workspace;
  const Task = require('./Task').Task;
  const WorkspaceMember = require('./WorkspaceMember').WorkspaceMember;

  (User as any).belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  (User as any).belongsToMany(Workspace, {
    through: WorkspaceMember,
    foreignKey: 'user_id',
    otherKey: 'workspace_id',
    as: 'workspaces'
  });

  (User as any).hasMany(Task, {
    foreignKey: 'created_by',
    as: 'created_tasks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  (User as any).hasMany(Task, {
    foreignKey: 'assigned_to',
    as: 'assigned_tasks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
}

export { User, UserAttributes, UserCreationAttributes };
