import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface BoardAttributes {
  id: string;
  company_id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  settings: Record<string, unknown>;
  visibility: "private" | "workspace" | "company" | "public";
  task_count: number;
  archived_task_count: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  archived_at?: Date;
  deleted_at?: Date | null;
}

interface BoardCreationAttributes extends Optional<
  BoardAttributes,
  | "id"
  | "settings"
  | "visibility"
  | "task_count"
  | "archived_task_count"
  | "created_at"
  | "updated_at"
  | "created_by"
  | "archived_at"
  | "deleted_at"
> { }

class Board
  extends Model<BoardAttributes, BoardCreationAttributes>
  implements BoardAttributes {
  public id!: string;
  public company_id!: string;
  public workspace_id!: string;
  public name!: string;
  public slug!: string;
  public description?: string;
  public icon?: string;
  public color?: string;
  public settings!: Record<string, unknown>;
  public visibility!: "private" | "workspace" | "company" | "public";
  public task_count!: number;
  public archived_task_count!: number;
  public created_by?: string;
  public archived_at?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date | null;
}

Board.init(
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
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "workspace_id",
      references: {
        model: "workspaces",
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
      defaultValue: "#10B981",
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        columns: ["todo", "in_progress", "review", "done"],
        defaultView: "board",
        allowComments: true,
        allowAttachments: true,
        taskNumbering: true,
      },
    },
    visibility: {
      type: DataTypes.ENUM("private", "workspace", "company", "public"),
      defaultValue: "workspace",
    },
    task_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "task_count",
    },
    archived_task_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "archived_task_count",
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
    archived_at: {
      type: DataTypes.DATE,
      field: "archived_at",
    },
    deleted_at: {
      type: DataTypes.DATE,
      field: "deleted_at",
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "Board",
    tableName: "boards",
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["workspace_id", "slug"],
      },
      {
        fields: ["company_id"],
      },
      {
        fields: ["workspace_id"],
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

export function setupBoardAssociations() {
  const { Company } = require("./Company");
  const { Workspace } = require("./Workspace");
  const { User } = require("./User");
  const { BoardColumn } = require("./BoardColumn");
  const { Task } = require("./Task");

  Board.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  Board.belongsTo(Workspace, {
    foreignKey: "workspace_id",
    as: "workspace",
    onDelete: "CASCADE",
  });

  Board.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  Board.hasMany(BoardColumn, {
    foreignKey: "board_id",
    as: "columns",
    onDelete: "CASCADE",
  });

  Board.hasMany(Task, {
    foreignKey: "board_id",
    as: "tasks",
    onDelete: "CASCADE",
  });
}

export { Board, BoardAttributes, BoardCreationAttributes };
