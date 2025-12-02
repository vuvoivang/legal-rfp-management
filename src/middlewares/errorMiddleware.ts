import { NextFunction, Request, Response } from "express";

export const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Error", err);
  // TODO: Store logging
  const status = err.status || 500;
  return res
    .status(status)
    .json({ message: err.message || "Internal Server Error" });
};
