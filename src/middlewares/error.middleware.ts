import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";

// Error handling middleware
const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if ("statusCode" in err) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  }

  // Log error for server-side debugging
  console.error(`[ERROR] ${err.name}:`, err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Send response
  res.status(statusCode).json({
    status: "error",
    message,
    // Only include stack in development mode
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
