// validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod"; // 1. Use ZodType instead of ZodSchema
import { ValidationError } from "../utils/error.utils";

type ValidationSource = "body" | "query" | "params";

/**
 * Middleware to validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Where to get data from ('body', 'query', 'params')
 * @returns Express middleware function
 */
// 2. Use ZodType<any> to accept any Zod object/string/array schema

export const validate = (
  schema: ZodType<any>,
  source: ValidationSource = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source];

      // .parse() is strictly typed on ZodType
      const validatedData = schema.parse(dataToValidate);

      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // 3. Explicitly type the mapping to fix 'implicit any' errors
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        // 4. 'e' is now correctly inferred as { field: string; message: string }
        const errorMessage = errors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ");

        return next(new ValidationError(errorMessage));
      }

      next(error);
    }
  };
};
