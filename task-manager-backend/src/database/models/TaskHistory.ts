import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface TaskHistoryAttributes {
  id: string;
  company_id: string;
  task_id: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "commented"
    | "attachment_added";
  field_changed?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  change_description?: string;
  changed_at?: Date;
  changed_by: string;
}

interface TaskHistoryCreationAttributes extends Optional<
  TaskHistoryAttributes,
  | "id"
  | "field_changed"
  | "old_value"
  | "new_value"
  | "change_description"
  | "changed_at"
> { }

class TaskHistory
  extends Model<TaskHistoryAttributes, TaskHistoryCreationAttributes>
  implements TaskHistoryAttributes {
  public id!: string;
  public company_id!: string;
  public task_id!: string;
  public action!:
    | "created"
    | "updated"
    | "deleted"
    | "status_changed"
    | "assigned"
    | "commented"
    | "attachment_added";
  public field_changed?: string;
  public old_value?: Record<string, unknown>;
  public new_value?: Record<string, unknown>;
  public change_description?: string;
  public changed_by!: string;

  public readonly changed_at!: Date;
}

TaskHistory.init(
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
    action: {
      type: DataTypes.ENUM(
        "created",
        "updated",
        "deleted",
        "status_changed",
        "assigned",
        "commented",
        "attachment_added"
      ),
      allowNull: false,
    },
    field_changed: {
      type: DataTypes.STRING(100),
      field: "field_changed",
    },
    old_value: {
      type: DataTypes.JSONB,
      field: "old_value",
    },
    new_value: {
      type: DataTypes.JSONB,
      field: "new_value",
    },
    change_description: {
      type: DataTypes.TEXT,
      field: "change_description",
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "changed_at",
    },
    changed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "changed_by",
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "TaskHistory",
    tableName: "task_history",
    underscored: true,
    timestamps: false,
    indexes: [
      {
        fields: ["task_id"],
      },
      {
        fields: ["company_id"],
      },
      {
        fields: ["changed_by"],
      },
      {
        fields: ["changed_at"],
      },
      {
        fields: ["action"],
      },
    ],
  },
);

export function setupTaskHistoryAssociations() {
  const { Company } = require("./Company");
  const { Task } = require("./Task");
  const { User } = require("./User");

  TaskHistory.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  TaskHistory.belongsTo(Task, {
    foreignKey: "task_id",
    as: "task",
    onDelete: "CASCADE",
  });

  TaskHistory.belongsTo(User, {
    foreignKey: "changed_by",
    as: "changedBy",
    onDelete: "CASCADE",
  });
}

export { TaskHistory, TaskHistoryAttributes, TaskHistoryCreationAttributes };
