import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface AuditLogsAttributes {
  id: string;
  company_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  diff: Record<string, unknown>;
  user_id: string;
  user_ip: string;
  user_agent: string;
  performed_at: Date;
}

type AuditLogsCreationAttributes = Optional<
  AuditLogsAttributes,
  | "id"
  | "performed_at"
  | "old_data"
  | "new_data"
  | "diff"
  | "user_ip"
  | "user_agent"
>;

class AuditLogs
  extends Model<AuditLogsAttributes, AuditLogsCreationAttributes>
  implements AuditLogsAttributes
{
  public id!: string;
  public company_id!: string;
  public action!: string;
  public entity_type!: string;
  public entity_id!: string;
  public old_data!: Record<string, unknown>;
  public new_data!: Record<string, unknown>;
  public diff!: Record<string, unknown>;
  public user_id!: string;
  public readonly user_ip!: string;
  public readonly user_agent!: string;
  public readonly performed_at!: Date;
}

AuditLogs.init(
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "entity_type",
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "entity_id",
    },
    old_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "old_data",
    },
    new_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "new_data",
    },
    diff: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "diff",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    user_ip: {
      type: DataTypes.INET,
      allowNull: true,
      field: "user_ip",
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
    performed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      primaryKey: true,
      field: "performed_at",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "AuditLogs",
    tableName: "audit_logs",
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["company_id", "action", "entity_type", "entity_id"],
      },
      {
        fields: ["performed_at"],
      },
    ],
    defaultScope: {
      attributes: {
        exclude: ["old_data", "new_data", "diff"],
      },
    },
  },
);

export { AuditLogs, AuditLogsAttributes, AuditLogsCreationAttributes };
