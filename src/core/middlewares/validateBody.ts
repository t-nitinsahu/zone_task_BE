import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export const validateBody = (schema: AnyZodObject) => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    request.body = schema.parse(request.body);
    next();
  };
};
