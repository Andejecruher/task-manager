import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface WorkspaceAttributes {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  settings: Record<string, unknown>;
  is_private: boolean;
  task_count: number;
  member_count: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  deleted_at?: Date | null;
}

interface WorkspaceCreationAttributes extends Optional<
  WorkspaceAttributes,
  | "id"
  | "settings"
  | "is_private"
  | "task_count"
  | "member_count"
  | "created_at"
  | "updated_at"
  | "created_by"
  | "deleted_at"
> { }

class Workspace
  extends Model<WorkspaceAttributes, WorkspaceCreationAttributes>
  implements WorkspaceAttributes {
  declare id: string;
  declare company_id: string;
  declare name: string;
  declare slug: string;
  declare description?: string;
  declare icon?: string;
  declare color?: string;
  declare settings: Record<string, unknown>;
  declare is_private: boolean;
  declare task_count: number;
  declare member_count: number;
  declare created_by?: string;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at?: Date | null;
}

Workspace.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING(50),
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#3B82F6",
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_private",
    },
    task_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "task_count",
    },
    member_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "member_count",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
    created_by: {
      type: DataTypes.UUID,
      field: "created_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    deleted_at: {
      type: DataTypes.DATE,
      field: "deleted_at",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "Workspace",
    tableName: "workspaces",
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["company_id", "slug"],
      },
      {
        fields: ["company_id"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["deleted_at"],
        where: { deleted_at: null } as any,
      },
    ],
  },
);

export function setupWorkspaceAssociations() {
  const { Company } = require("./Company");
  const { User } = require("./User");
  const { WorkspaceMember } = require("./WorkspaceMember");
  const { Board } = require("./Board");

  Workspace.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  Workspace.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Workspace.hasMany(WorkspaceMember, {
    foreignKey: "workspace_id",
    as: "members",
    onDelete: "CASCADE",
  });

  Workspace.hasMany(Board, {
    foreignKey: "workspace_id",
    as: "boards",
    onDelete: "CASCADE",
  });
}

export { Workspace, WorkspaceAttributes, WorkspaceCreationAttributes };
