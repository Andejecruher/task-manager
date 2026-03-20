/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - fullName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         fullName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, MEMBER]
 *     UpdateUserRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, MEMBER]
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         fullName:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *         companyId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         emailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en la compañía actual. Requiere rol ADMIN.
 *     operationId: userCreate
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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
 *         description: Acceso prohibido - Se requiere rol ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email ya existe
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
 * /api/v1/user/{id}/rol:
 *   patch:
 *     summary: Actualizar rol del usuario
 *     description: Actualiza el rol de un usuario. Requiere rol ADMIN.
 *     operationId: userUpdateRole
 *     tags: [User]
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
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         description: Rol actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario de la compañía. Requiere rol ADMIN.
 *     operationId: userDelete
 *     tags: [User]
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
 *         description: Usuario eliminado
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

/**
 * @swagger
 * /api/v1/user/{id}/deactivate:
 *   patch:
 *     summary: Desactivar usuario
 *     description: Desactiva un usuario sin eliminarlo. Requiere rol ADMIN.
 *     operationId: userDeactivate
 *     tags: [User]
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
 *         description: Usuario desactivado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
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

