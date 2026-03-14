import { Company, setupCompanyAssociations } from "@/database/models/Company";
import { User, setupUserAssociations } from "@/database/models/User";
import { UserSession } from "@/database/models/UserSession";
import { AuditLogs } from "@/database/models/AuditLogs";
import { Invitation } from "@/database/models/Invitation";
import { Notification } from "@/database/models/Notification";
import {
  Workspace,
  setupWorkspaceAssociations,
} from "@/database/models/Workspace";
import {
  WorkspaceMember,
  setupWorkspaceMemberAssociations,
} from "@/database/models/WorkspaceMember";
import { Board, setupBoardAssociations } from "@/database/models/Board";
import {
  BoardColumn,
  setupBoardColumnAssociations,
} from "@/database/models/BoardColumn";
import { Task, setupTaskAssociations } from "@/database/models/Task";
import {
  TaskComment,
  setupTaskCommentAssociations,
} from "@/database/models/TaskComment";
import {
  TaskAttachment,
  setupTaskAttachmentAssociations,
} from "@/database/models/TaskAttachment";
import {
  TaskHistory,
  setupTaskHistoryAssociations,
} from "@/database/models/TaskHistory";

export {
  Company,
  User,
  UserSession,
  AuditLogs,
  Invitation,
  Notification,
  Workspace,
  WorkspaceMember,
  Board,
  BoardColumn,
  Task,
  TaskComment,
  TaskAttachment,
  TaskHistory,
};

/**
 * Inicializa todas las asociaciones entre modelos
 * Debe ser llamado después de que todos los modelos estén inicializados
 */
export function initializeAssociations() {
  setupCompanyAssociations();
  setupUserAssociations();
  setupWorkspaceAssociations();
  setupWorkspaceMemberAssociations();
  setupBoardAssociations();
  setupBoardColumnAssociations();
  setupTaskAssociations();
  setupTaskCommentAssociations();
  setupTaskAttachmentAssociations();
  setupTaskHistoryAssociations();
}
