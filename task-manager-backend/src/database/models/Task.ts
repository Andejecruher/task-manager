import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface TaskAttributes {
  id: string;
  company_id: string;
  workspace_id: string;
  board_id: string;
  task_number: number;
  title: string;
  description?: string;
  description_html?: string;
  column_id?: string;
  status: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  assignee_ids?: string[];
  due_date?: Date;
  start_date?: Date;
  completed_at?: Date;
  time_estimate?: number;
  tags?: string[];
  metadata: Record<string, unknown>;
  total_time_spent: number;
  last_time_tracked_at?: Date;
  parent_task_id?: string;
  related_task_ids?: string[];
  created_at?: Date;
  updated_at?: Date;
  created_by: string;
  updated_by?: string;
  deleted_at?: Date | null;
}

interface TaskCreationAttributes extends Optional<
  TaskAttributes,
  | "id"
  | "task_number"
  | "description_html"
  | "column_id"
  | "priority"
  | "assignee_ids"
  | "time_estimate"
  | "tags"
  | "metadata"
  | "total_time_spent"
  | "last_time_tracked_at"
  | "parent_task_id"
  | "related_task_ids"
  | "created_at"
  | "updated_at"
  | "updated_by"
  | "deleted_at"
> { }

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes {
  public id!: string;
  public company_id!: string;
  public workspace_id!: string;
  public board_id!: string;
  public task_number!: number;
  public title!: string;
  public description?: string;
  public description_html?: string;
  public column_id?: string;
  public status!: "todo" | "in_progress" | "review" | "done" | "blocked" | "cancelled";
  public priority!: "low" | "medium" | "high" | "urgent";
  public assignee_id?: string;
  public assignee_ids?: string[];
  public due_date?: Date;
  public start_date?: Date;
  public completed_at?: Date;
  public time_estimate?: number;
  public tags?: string[];
  public metadata!: Record<string, unknown>;
  public total_time_spent!: number;
  public last_time_tracked_at?: Date;
  public parent_task_id?: string;
  public related_task_ids?: string[];
  public created_by!: string;
  public updated_by?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date | null;
}

Task.init(
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
    board_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "board_id",
      references: {
        model: "boards",
        key: "id",
      },
    },
    task_number: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      field: "task_number",
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    description_html: {
      type: DataTypes.TEXT,
      field: "description_html",
    },
    column_id: {
      type: DataTypes.UUID,
      field: "column_id",
      references: {
        model: "board_columns",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "todo",
        "in_progress",
        "review",
        "done",
        "blocked",
        "cancelled"
      ),
      defaultValue: "todo",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
    assignee_id: {
      type: DataTypes.UUID,
      field: "assignee_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    assignee_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      field: "assignee_ids",
    },
    due_date: {
      type: DataTypes.DATE,
      field: "due_date",
    },
    start_date: {
      type: DataTypes.DATE,
      field: "start_date",
    },
    completed_at: {
      type: DataTypes.DATE,
      field: "completed_at",
    },
    time_estimate: {
      type: DataTypes.INTEGER,
      field: "time_estimate",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING(50)),
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    total_time_spent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_time_spent",
    },
    last_time_tracked_at: {
      type: DataTypes.DATE,
      field: "last_time_tracked_at",
    },
    parent_task_id: {
      type: DataTypes.UUID,
      field: "parent_task_id",
      references: {
        model: "tasks",
        key: "id",
      },
    },
    related_task_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      field: "related_task_ids",
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
      allowNull: false,
      field: "created_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    updated_by: {
      type: DataTypes.UUID,
      field: "updated_by",
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
    modelName: "Task",
    tableName: "tasks",
    underscored: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["company_id", "task_number"],
      },
      {
        fields: ["company_id"],
      },
      {
        fields: ["workspace_id"],
      },
      {
        fields: ["board_id"],
      },
      {
        fields: ["column_id"],
      },
      {
        fields: ["assignee_id"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["due_date"],
      },
      {
        fields: ["tags"],
        using: "gin",
      },
      {
        fields: ["deleted_at"],
        where: { deleted_at: null } as any,
      },
      {
        fields: ["completed_at"],
        where: { completed_at: null } as any,
      },
    ],
  },
);

export function setupTaskAssociations() {
  const { Company } = require("./Company");
  const { Workspace } = require("./Workspace");
  const { Board } = require("./Board");
  const { BoardColumn } = require("./BoardColumn");
  const { User } = require("./User");
  const { TaskComment } = require("./TaskComment");
  const { TaskAttachment } = require("./TaskAttachment");
  const { TaskHistory } = require("./TaskHistory");

  Task.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  Task.belongsTo(Workspace, {
    foreignKey: "workspace_id",
    as: "workspace",
    onDelete: "CASCADE",
  });

  Task.belongsTo(Board, {
    foreignKey: "board_id",
    as: "board",
    onDelete: "CASCADE",
  });

  Task.belongsTo(BoardColumn, {
    foreignKey: "column_id",
    as: "column",
    onDelete: "SET NULL",
  });

  Task.belongsTo(User, {
    foreignKey: "assignee_id",
    as: "assignee",
    onDelete: "SET NULL",
  });

  Task.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "CASCADE",
  });

  Task.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });

  Task.belongsTo(Task, {
    foreignKey: "parent_task_id",
    as: "parentTask",
    onDelete: "SET NULL",
  });

  Task.hasMany(Task, {
    foreignKey: "parent_task_id",
    as: "subtasks",
    onDelete: "CASCADE",
  });

  Task.hasMany(TaskComment, {
    foreignKey: "task_id",
    as: "comments",
    onDelete: "CASCADE",
  });

  Task.hasMany(TaskAttachment, {
    foreignKey: "task_id",
    as: "attachments",
    onDelete: "CASCADE",
  });

  Task.hasMany(TaskHistory, {
    foreignKey: "task_id",
    as: "history",
    onDelete: "CASCADE",
  });
}

export { Task, TaskAttributes, TaskCreationAttributes };
