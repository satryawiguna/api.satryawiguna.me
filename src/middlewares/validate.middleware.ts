import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

// Zod validation middleware
const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request against the provided schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // If validation passes, proceed to the next middleware or controller
      return next();
    } catch (error: any) {
      // If validation fails, format the errors and return them
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: error.errors || error.message,
      });
    }
  };
};

export default validate;
