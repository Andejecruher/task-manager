/**
 * @swagger
 * tags:
 *   name: Workspace
 *   description: Gestión de espacios de trabajo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWorkspaceRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *     UpdateWorkspaceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *     Workspace:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         companyId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WorkspaceMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         workspaceId:
 *           type: string
 *         role:
 *           type: string
 *           enum: [OWNER, MANAGER, MEMBER]
 *         joinedAt:
 *           type: string
 *           format: date-time
 *     AddWorkspaceMemberRequest:
 *       type: object
 *       required:
 *         - userId
 *         - role
 *       properties:
 *         userId:
 *           type: string
 *         role:
 *           type: string
 *           enum: [OWNER, MANAGER, MEMBER]
 */

/**
 * @swagger
 * /api/v1/workspace:
 *   get:
 *     summary: Listar espacios de trabajo
 *     description: Obtiene todos los espacios de trabajo de la compañía actual
 *     operationId: workspaceList
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Espacios de trabajo obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Crear espacio de trabajo
 *     description: Crea un nuevo espacio de trabajo en la compañía actual
 *     operationId: workspaceCreate
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceRequest'
 *     responses:
 *       201:
 *         description: Espacio de trabajo creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /api/v1/workspace/{id}:
 *   get:
 *     summary: Obtener espacio de trabajo
 *     description: Obtiene los detalles de un espacio de trabajo específico
 *     operationId: workspaceGet
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espacio de trabajo obtenido
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Workspace'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   put:
 *     summary: Actualizar espacio de trabajo
 *     description: Actualiza los detalles de un espacio de trabajo
 *     operationId: workspaceUpdate
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkspaceRequest'
 *     responses:
 *       200:
 *         description: Espacio de trabajo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Workspace'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     summary: Eliminar espacio de trabajo
 *     description: Elimina un espacio de trabajo y todos sus contenidos asociados
 *     operationId: workspaceDelete
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Espacio de trabajo eliminado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /api/v1/workspace/{id}/members:
 *   get:
 *     summary: Listar miembros del espacio de trabajo
 *     description: Obtiene todos los miembros de un espacio de trabajo
 *     operationId: workspaceListMembers
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembros obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkspaceMember'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Agregar miembro al espacio de trabajo
 *     description: Agrega un usuario como miembro a un espacio de trabajo
 *     operationId: workspaceAddMember
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddWorkspaceMemberRequest'
 *     responses:
 *       201:
 *         description: Miembro agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkspaceMember'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ApiValidationError'
 *                 - $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo o usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: El usuario ya es miembro del espacio de trabajo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /api/v1/workspace/{id}/members/{memberId}:
 *   delete:
 *     summary: Remover miembro del espacio de trabajo
 *     description: Elimina un usuario del espacio de trabajo
 *     operationId: workspaceRemoveMember
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro removido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo o miembro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

/**
 * @swagger
 * /api/v1/workspace/{id}/tasks:
 *   get:
 *     summary: Listar tareas del espacio de trabajo
 *     description: Obtiene todas las tareas de un espacio de trabajo
 *     operationId: workspaceListTasks
 *     tags: [Workspace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tareas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Espacio de trabajo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// Empty export to make this a module
export { };

