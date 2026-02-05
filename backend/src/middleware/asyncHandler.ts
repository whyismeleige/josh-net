import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define a type for the async controller function
// It accepts standard Express arguments and returns a Promise
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncController): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;