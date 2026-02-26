import { Company, setupCompanyAssociations } from "./Company";
import { User, setupUserAssociations } from "./User";
import { UserSession } from "./UserSession";
import { AuditLogs } from "./AuditLogs";
import { Invitation } from "./Invitation";
import { Notification } from "./Notification";

export {
  Company,
  User,
  UserSession,
  AuditLogs,
  Invitation,
  Notification,
};

/**
 * Inicializa todas las asociaciones entre modelos
 * Debe ser llamado después de que todos los modelos estén inicializados
 */
export function initializeAssociations() {
  setupCompanyAssociations();
  setupUserAssociations();
}
