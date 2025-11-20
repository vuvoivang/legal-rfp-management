import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import User from "../models/User";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer"))
      return res.status(401).json({ message: "Unauthorized" });
    const token = header.split(" ")[1]; // format: Bearer {token}
    const { id, role } = verifyAccessToken(token) as {
      id: string;
      role: string;
    };

    // exclude 'hashedPassword' field - sensitive data
    const user = await User.findById(id).select("-hashedPassword");
    if (!user || role !== user.role)
      return res.status(401).json({ message: "Unauthorized" });

    // attach user data to request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
