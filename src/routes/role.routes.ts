import { Router } from "express";
import { roleController } from "../controllers";
import validate from "../middlewares/validate.middleware";
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema,
} from "../validators";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  checkPermission(["CREATE_ROLE"]),
  validate(createRoleSchema),
  roleController.createRole
);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  checkPermission(["READ_ROLE"]),
  roleController.getAllRoles
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.get(
  "/:id",
  authenticate,
  checkPermission(["READ_ROLE"]),
  roleController.getRoleById
);

/**
 * @swagger
 * /api/roles/{id}:
 *   patch:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.patch(
  "/:id",
  authenticate,
  checkPermission(["UPDATE_ROLE"]),
  validate(updateRoleSchema),
  roleController.updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.delete(
  "/:id",
  authenticate,
  checkPermission(["DELETE_ROLE"]),
  roleController.deleteRole
);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Get role permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role not found
 */
router.get(
  "/:id/permissions",
  authenticate,
  checkPermission(["READ_ROLE", "READ_PERMISSION"]),
  roleController.getRolePermissions
);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   post:
 *     summary: Assign permissions to role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Role or permission not found
 */
router.post(
  "/:id/permissions",
  authenticate,
  checkPermission(["UPDATE_ROLE", "READ_PERMISSION"]),
  validate(assignPermissionsSchema),
  roleController.assignPermissionsToRole
);

export default router;
