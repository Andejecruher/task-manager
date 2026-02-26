import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface UserSessionAttributes {
  id: string;
  company_id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  devices_info: Record<string, unknown>;
  ip_address: string;
  is_active: boolean;
  last_activity_at: Date;
  expires_at: Date;
  refresh_token_expires_at: Date;
  created_at?: Date;
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
  public id!: string;
  public company_id!: string;
  public user_id!: string;
  public session_token!: string;
  public refresh_token!: string;
  public devices_info!: Record<string, unknown>;
  public ip_address!: string;
  public is_active!: boolean;
  public last_activity_at!: Date;
  public expires_at!: Date;
  public refresh_token_expires_at!: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly revoked_at?: Date | null;
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
    devices_info: {
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
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "UserSession",
    tableName: "Usersessions",
    underscored: true,
    paranoid: true,
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
