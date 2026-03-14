import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";
import { DeviceInfo } from "@/types";

interface UserSessionAttributes {
  id: string;
  company_id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  device_info: DeviceInfo;
  ip_address: string;
  is_active: boolean;
  last_activity_at: Date;
  expires_at: Date;
  refresh_token_expires_at: Date;
  created_at?: Date;
  updated_at?: Date;
  revoked_at?: Date | null;
}

interface UserSessionCreationAttributes extends Optional<
  UserSessionAttributes,
  "id" | "created_at" | "revoked_at"
> {}

class UserSession
  extends Model<UserSessionAttributes, UserSessionCreationAttributes>
  implements UserSessionAttributes
{
  declare id: string;
  declare company_id: string;
  declare user_id: string;
  declare session_token: string;
  declare refresh_token: string;
  declare device_info: DeviceInfo;
  declare ip_address: string;
  declare is_active: boolean;
  declare last_activity_at: Date;
  declare expires_at: Date;
  declare refresh_token_expires_at: Date;

  // Timestamps
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly revoked_at?: Date | null;

  // Asociaciones
  declare readonly company?: any;
  declare readonly user?: any;
}

UserSession.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    session_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    device_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_activity_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    refresh_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "UserSession",
    tableName: "user_sessions",
    underscored: true,
    paranoid: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["session_token"],
      },

      {
        unique: true,
        fields: ["refresh_token"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["company_id"],
      },
    ],
  },
);

export { UserSession, UserSessionAttributes, UserSessionCreationAttributes };
