import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "@/database/connection-sequelize";

interface BoardColumnAttributes {
  id: string;
  board_id: string;
  company_id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  position: number;
  task_limit?: number;
  wip_limit?: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

interface BoardColumnCreationAttributes extends Optional<
  BoardColumnAttributes,
  | "id"
  | "color"
  | "description"
  | "task_limit"
  | "wip_limit"
  | "created_at"
  | "updated_at"
  | "created_by"
> { }

class BoardColumn
  extends Model<BoardColumnAttributes, BoardColumnCreationAttributes>
  implements BoardColumnAttributes {
  declare id: string;
  declare board_id: string;
  declare company_id: string;
  declare name: string;
  declare slug: string;
  declare color?: string;
  declare description?: string;
  declare position: number;
  declare task_limit?: number;
  declare wip_limit?: number;
  declare created_by?: string;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

BoardColumn.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: "#6B7280",
    },
    description: {
      type: DataTypes.TEXT,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    task_limit: {
      type: DataTypes.INTEGER,
      field: "task_limit",
    },
    wip_limit: {
      type: DataTypes.INTEGER,
      field: "wip_limit",
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
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "BoardColumn",
    tableName: "board_columns",
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["board_id", "slug"],
      },
      {
        unique: true,
        fields: ["board_id", "position"],
      },
      {
        fields: ["board_id"],
      },
      {
        fields: ["company_id"],
      },
    ],
  },
);

export function setupBoardColumnAssociations() {
  const { Board } = require("./Board");
  const { Company } = require("./Company");
  const { User } = require("./User");
  const { Task } = require("./Task");

  BoardColumn.belongsTo(Board, {
    foreignKey: "board_id",
    as: "board",
    onDelete: "CASCADE",
  });

  BoardColumn.belongsTo(Company, {
    foreignKey: "company_id",
    as: "company",
    onDelete: "CASCADE",
  });

  BoardColumn.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
    onDelete: "SET NULL",
  });

  BoardColumn.hasMany(Task, {
    foreignKey: "column_id",
    as: "tasks",
    onDelete: "SET NULL",
  });
}

export { BoardColumn, BoardColumnAttributes, BoardColumnCreationAttributes };
