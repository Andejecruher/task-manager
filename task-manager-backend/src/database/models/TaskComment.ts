import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface TaskCommentAttributes {
  id: string;
  company_id: string;
  task_id: string;
  content: string;
  content_html?: string;
  mentioned_user_ids?: string[];
  created_at?: Date;
  updated_at?: Date;
  created_by: string;
  updated_by?: string;
  deleted_at?: Date | null;
}

interface TaskCommentCreationAttributes extends Optional<
  TaskCommentAttributes,
  | "id"
  | "content_html"
  | "mentioned_user_ids"
  | "created_at"
  | "updated_at"
  | "updated_by"
  | "deleted_at"
> {}

class TaskComment
  extends Model<TaskCommentAttributes, TaskCommentCreationAttributes>
  implements TaskCommentAttributes
{
  declare id: string;
  declare company_id: string;
  declare task_id: string;
  declare content: string;
  declare content_html?: string;
  declare mentioned_user_ids?: string[];
  declare created_by: string;
  declare updated_by?: string;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at?: Date | null;
}

TaskComment.init(
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
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "task_id",
      references: {
        model: "tasks",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content_html: {
      type: DataTypes.TEXT,
      field: "content_html",
    },
    mentioned_user_ids: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      field: "mentioned_user_ids",
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
    modelName: "TaskComment",
    tableName: "task_comments",
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ["task_id"],
      },
      {
        fields: ["company_id"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["deleted_at"],
        where: { deleted_at: null } as any,
      },
    ],
  },
);

export function setupTaskCommentAssociations() {
  const { Company } = require("./Company");
  const { Task } = require("./Task");
  const { User } = require("./User");

  TaskComment.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  TaskComment.belongsTo(Task, {
    foreignKey: "task_id",
    as: "task",
    onDelete: "CASCADE",
  });

  TaskComment.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "CASCADE",
  });

  TaskComment.belongsTo(User, {
    foreignKey: "updated_by",
    as: "updater",
    onDelete: "SET NULL",
  });
}

export { TaskComment, TaskCommentAttributes, TaskCommentCreationAttributes };
