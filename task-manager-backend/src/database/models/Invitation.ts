import { DataTypes, Model, Optional } from "sequelize";
import { sequelizeConnection } from "../connection-sequelize";

interface InvitationAttributes {
  id: string;
  company_id: string;
  email: string;
  token: string;
  role: string;
  invited_by: string;
  workspace_id?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  accepted_at?: Date;
  expires_at: Date;
  created_at?: Date;
}

interface InvitationCreationAttributes extends Optional<
  InvitationAttributes,
  "id" | "created_at" | "status" | "accepted_at" | "workspace_id"
> {}

class Invitation
  extends Model<InvitationAttributes, InvitationCreationAttributes>
  implements InvitationAttributes
{
  public id!: string;
  public company_id!: string;
  public email!: string;
  public token!: string;
  public role!: string;
  public workspace_id?: string;
  public status!: "pending" | "accepted" | "declined" | "expired";
  public accepted_at?: Date;
  public invited_by!: string;
  public expires_at!: Date;

  // Timestamps
  public readonly created_at!: Date;
}

Invitation.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
    },
    invited_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "invited_by",
      references: {
        model: "users",
        key: "id",
      },
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "workspace_id",
      references: {
        model: "workspaces",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined", "expired"),
      defaultValue: "pending",
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelizeConnection.getSequelize(),
    modelName: "Invitation",
    tableName: "invitations",
    underscored: true,
    timestamps: false,
    //paranoid: true,
    indexes: [
      { fields: ["status"] }, // Para filtrar por estado
      { fields: ["expires_at"] }, // Para limpiar expiradas
      { fields: ["invited_by"] }, // Para auditoría

      {
        unique: true,
        fields: ["company_id", "email"],
      },
      {
        fields: ["token"],
      },
    ],
  },
);

export { Invitation, InvitationAttributes, InvitationCreationAttributes };
