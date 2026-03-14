import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "../connection-sequelize";

interface NotificationAttributes {
  id: string;
  company_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  is_archived: boolean;
  created_at?: Date;
  read_at?: Date;
  expires_at?: Date;
}

interface NotificationCreationAttributes extends Optional<
  NotificationAttributes,
  "id" | "is_read" | "is_archived" | "created_at" | "read_at" | "expires_at"
> {}

class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: string;
  declare company_id: string;
  declare user_id: string;
  declare type: string;
  declare title: string;
  declare message: string;
  declare data: Record<string, unknown>;
  declare is_read: boolean;
  declare is_archived: boolean;

  // Timestamps
  declare readonly created_at: Date;
  declare readonly read_at?: Date;
  declare readonly expires_at?: Date;
}

Notification.init(
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
    type: {
      type: DataTypes.ENUM(
        "task_assigned",
        "task_updated",
        "mention",
        "comment",
        "due_date",
        "invitation",
        "system",
      ), // ✅ Enum
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
    },
    expires_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "Notification",
    tableName: "notifications",
    underscored: true,
    timestamps: false,
    indexes: [
      {
        fields: ["company_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["is_read"],
      },
      {
        fields: ["is_archived"],
      },
    ],
  },
);

export { Notification, NotificationAttributes, NotificationCreationAttributes };
