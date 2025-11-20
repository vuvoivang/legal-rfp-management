import { Response } from "express";
export const isNil = (item: any) => item === null || item === undefined;

export const success = (res: Response, data: any, status = 200, meta = {}) =>
  res.status(status).json({ success: true, data, ...meta });

export const failure = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });
