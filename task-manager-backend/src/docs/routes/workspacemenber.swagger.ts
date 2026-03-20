/**
 * @swagger
 * tags:
 *   name: WorkspaceMember
 *   description: Gestión de membresía en espacios de trabajo
 */

/**
 * @swagger
 * /api/v1/workspace/members:
 *   get:
 *     summary: Listar espacios de trabajo del usuario actual
 *     description: Obtiene todos los espacios de trabajo donde el usuario actual es miembro
 *     operationId: workspaceMemberListForUser
 *     tags: [WorkspaceMember]
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           workspaceId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [OWNER, MANAGER, MEMBER]
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
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
 * /api/v1/workspace/members/{userId}:
 *   get:
 *     summary: Listar espacios de trabajo de un usuario específico
 *     description: Obtiene todos los espacios de trabajo donde un usuario es miembro. Requiere permisos administrativos.
 *     operationId: workspaceMemberListForUserId
 *     tags: [WorkspaceMember]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           workspaceId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           role:
 *                             type: string
 *                             enum: [OWNER, MANAGER, MEMBER]
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Acceso prohibido - Se requiere rol ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Usuario no encontrado
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

