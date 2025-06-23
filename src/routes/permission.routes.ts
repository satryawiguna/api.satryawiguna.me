import { Router } from "express";
import { permissionController } from "../controllers";
import validate from "../middlewares/validate.middleware";
import { createPermissionSchema, updatePermissionSchema } from "../validators";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management endpoints
 */

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
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
 *         description: Permission created successfully
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
  checkPermission(["CREATE_PERMISSION"]),
  validate(createPermissionSchema),
  permissionController.createPermission
);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authenticate,
  checkPermission(["READ_PERMISSION"]),
  permissionController.getAllPermissions
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 */
router.get(
  "/:id",
  authenticate,
  checkPermission(["READ_PERMISSION"]),
  permissionController.getPermissionById
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   patch:
 *     summary: Update a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Permission ID
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
 *         description: Permission updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 */
router.patch(
  "/:id",
  authenticate,
  checkPermission(["UPDATE_PERMISSION"]),
  validate(updatePermissionSchema),
  permissionController.updatePermission
);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Permission not found
 */
router.delete(
  "/:id",
  authenticate,
  checkPermission(["DELETE_PERMISSION"]),
  permissionController.deletePermission
);

export default router;
