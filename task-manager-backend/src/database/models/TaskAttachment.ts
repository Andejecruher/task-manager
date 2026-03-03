import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface TaskAttachmentAttributes {
  id: string;
  company_id: string;
  task_id: string;
  filename: string;
  original_filename?: string;
  file_size: number;
  mime_type?: string;
  storage_provider: string;
  storage_path: string;
  storage_url: string;
  thumbnail_url?: string;
  uploaded_at?: Date;
  uploaded_by: string;
  deleted_at?: Date | null;
}

interface TaskAttachmentCreationAttributes extends Optional<
  TaskAttachmentAttributes,
  | "id"
  | "original_filename"
  | "mime_type"
  | "storage_provider"
  | "thumbnail_url"
  | "uploaded_at"
  | "deleted_at"
> { }

class TaskAttachment
  extends Model<TaskAttachmentAttributes, TaskAttachmentCreationAttributes>
  implements TaskAttachmentAttributes {
  public id!: string;
  public company_id!: string;
  public task_id!: string;
  public filename!: string;
  public original_filename?: string;
  public file_size!: number;
  public mime_type?: string;
  public storage_provider!: string;
  public storage_path!: string;
  public storage_url!: string;
  public thumbnail_url?: string;
  public uploaded_by!: string;

  public readonly uploaded_at!: Date;
  public readonly deleted_at?: Date | null;
}

TaskAttachment.init(
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
    filename: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    original_filename: {
      type: DataTypes.STRING(500),
      field: "original_filename",
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "file_size",
    },
    mime_type: {
      type: DataTypes.STRING(100),
      field: "mime_type",
    },
    storage_provider: {
      type: DataTypes.STRING(50),
      defaultValue: "local",
      field: "storage_provider",
    },
    storage_path: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "storage_path",
    },
    storage_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "storage_url",
    },
    thumbnail_url: {
      type: DataTypes.TEXT,
      field: "thumbnail_url",
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "uploaded_at",
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "uploaded_by",
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
    modelName: "TaskAttachment",
    tableName: "task_attachments",
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
        fields: ["uploaded_by"],
      },
    ],
  },
);

export function setupTaskAttachmentAssociations() {
  const { Company } = require("./Company");
  const { Task } = require("./Task");
  const { User } = require("./User");

  TaskAttachment.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  TaskAttachment.belongsTo(Task, {
    foreignKey: "task_id",
    as: "task",
    onDelete: "CASCADE",
  });

  TaskAttachment.belongsTo(User, {
    foreignKey: "uploaded_by",
    as: "uploader",
    onDelete: "CASCADE",
  });
}

export {
  TaskAttachment,
  TaskAttachmentAttributes,
  TaskAttachmentCreationAttributes,
};
