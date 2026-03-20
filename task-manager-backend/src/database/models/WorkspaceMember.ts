import { sequelizeConnection } from "@/database/connection-sequelize";
import { DataTypes, Model, Optional } from "sequelize";

interface WorkspaceMemberAttributes {
  id: string;
  workspace_id: string;
  user_id: string;
  company_id: string;
  role: "admin" | "member" | "viewer";
  permissions: Record<string, unknown>;
  notification_settings: Record<string, unknown>;
  joined_at?: Date;
  invited_by?: string;
  invited_at?: Date;
}

type WorkspaceMemberCreationAttributes = Optional<
  WorkspaceMemberAttributes,
  | "id"
  | "permissions"
  | "notification_settings"
  | "joined_at"
  | "invited_by"
  | "invited_at"
>;

class WorkspaceMember
  extends Model<WorkspaceMemberAttributes, WorkspaceMemberCreationAttributes>
  implements WorkspaceMemberAttributes {
  declare id: string;
  declare workspace_id: string;
  declare user_id: string;
  declare company_id: string;
  declare role: "admin" | "member" | "viewer";
  declare permissions: Record<string, unknown>;
  declare notification_settings: Record<string, unknown>;
  declare joined_at?: Date;
  declare invited_by?: string;
  declare invited_at?: Date;
  declare deleted_at?: Date;
}

WorkspaceMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "workspace_id",
      references: {
        model: "workspaces",
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
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "company_id",
      references: {
        model: "companies",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "member", "viewer"),
      defaultValue: "member",
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    notification_settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        email: true,
        push: true,
        inApp: true,
        mentions: true,
        dailyDigest: false,
      },
      field: "notification_settings",
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "joined_at",
    },
    invited_by: {
      type: DataTypes.UUID,
      field: "invited_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    invited_at: {
      type: DataTypes.DATE,
      field: "invited_at",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "WorkspaceMember",
    tableName: "workspace_members",
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["workspace_id", "user_id"],
      },
      {
        fields: ["workspace_id"],
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

export function setupWorkspaceMemberAssociations() {
  const { Workspace } = require("./Workspace");
  const { User } = require("./User");
  const { Company } = require("./Company");

  WorkspaceMember.belongsTo(Workspace, {
    foreignKey: "workspace_id",
    as: "workspace",
    onDelete: "CASCADE",
  });

  WorkspaceMember.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    onDelete: "CASCADE",
  });

  WorkspaceMember.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  WorkspaceMember.belongsTo(User, {
    foreignKey: "invited_by",
    as: "inviter",
    onDelete: "SET NULL",
  });
}

export {
  WorkspaceMember,
  WorkspaceMemberAttributes,
  WorkspaceMemberCreationAttributes
};

