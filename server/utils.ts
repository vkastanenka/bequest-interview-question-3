// utils
import crypto from "crypto";
import { body, param, validationResult } from "express-validator";

// types
import { NextFunction, Request, Response } from "express";

export const generateHash = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// If any validation errors, return error response.
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: `${errors.array()[0].msg}!` });
  }

  next();
};

// Validate and sanitize body data
export const validateData = [
  body("data").isString().trim().isLength({ min: 1, max: 500 }).escape(),
];

// Validate and sanitize param timestamp
export const validateTimestamp = [
  param("timestamp").isString().trim().isLength({ min: 1, max: 27 }).escape(),
];
