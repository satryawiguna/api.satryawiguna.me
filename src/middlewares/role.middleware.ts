import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types";

interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Role-based authorization middleware
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const userRoles = req.user.roles || [];

      // Check if user has at least one of the allowed roles
      const hasPermission = allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: "error",
          message: "Access denied: Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Authorization error",
      });
    }
  };
};

// Permission-based authorization middleware
export const checkPermission = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required",
        });
      }

      const userPermissions = req.user.permissions || [];

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          status: "error",
          message: "Access denied: Insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Authorization error",
      });
    }
  };
};
