import {
    DataTypes,
    Model,
    Optional,
} from 'sequelize';
import { sequelizeConnection } from '../connection-sequelize';

// Atributos del modelo
interface CompanyAttributes {
    id: string;
    name: string;
    slug: string;
    website?: string;
    logoUrl?: string;
    plan: string;
    billingEmail?: string;
    subscriptionId?: string;
    trialEndsAt?: Date;
    settings: object;
    features: object;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

// Atributos para creación (id opcional)
interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'settings' | 'features' | 'plan'> { }

// Clase del modelo
class Company extends Model<CompanyAttributes, CompanyCreationAttributes>
    implements CompanyAttributes {
    public id!: string;
    public name!: string;
    public slug!: string;
    public website?: string;
    public logoUrl?: string;
    public plan!: string;
    public billingEmail?: string;
    public subscriptionId?: string;
    public trialEndsAt?: Date;
    public settings!: object;
    public features!: object;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt?: Date;

    // Métodos personalizados
    async getActiveUsersCount(): Promise<number> {
        const { User } = require('./User.model');
        return await User.count({
            where: {
                companyId: this.id,
                isActive: true,
                deletedAt: null
            }
        });
    }

    async getWorkspacesCount(): Promise<number> {
        const { Workspace } = require('./Workspace.model');
        return await Workspace.count({
            where: {
                companyId: this.id,
                deletedAt: null
            }
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
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 255]
            }
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ // slug format
            }
        },
        website: {
            type: DataTypes.STRING(500),
            validate: {
                isUrl: true
            }
        },
        logoUrl: {
            type: DataTypes.TEXT
        },
        plan: {
            type: DataTypes.ENUM('free', 'starter', 'pro', 'enterprise'),
            defaultValue: 'free',
            allowNull: false
        },
        billingEmail: {
            type: DataTypes.STRING(255),
            validate: {
                isEmail: true
            }
        },
        subscriptionId: {
            type: DataTypes.STRING(255)
        },
        trialEndsAt: {
            type: DataTypes.DATE
        },
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        features: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deleted_at'
        }
    },
    {
        sequelize: sequelizeConnection.getSequelize(),
        modelName: 'Company',
        tableName: 'companies',
        underscored: true,
        paranoid: true, // soft delete
        hooks: {
            beforeCreate: () => {
                // Validaciones o transformaciones antes de crear
            },
            afterCreate: (company: Company) => {
                // Logging, notificaciones, etc.
                console.log(`🏢 Compañía creada: ${company.name}`);
            }
        },
        indexes: [
            {
                unique: true,
                fields: ['slug']
            },
            {
                fields: ['deleted_at']
            },
            {
                fields: ['plan']
            }
        ]
    }
);

export { Company, CompanyAttributes, CompanyCreationAttributes };