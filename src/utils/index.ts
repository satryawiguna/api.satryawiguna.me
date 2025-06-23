import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JwtPayload } from "../types";
import config from "../config/env.config";

// JWT utility functions
export const generateToken = (
  payload: Omit<JwtPayload, "iat" | "exp">,
  expiresIn: string = config.JWT_EXPIRES_IN,
  secret: string = config.JWT_SECRET
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (
  token: string,
  secret: string = config.JWT_SECRET
): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

// Password utility functions
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Error utility functions
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
