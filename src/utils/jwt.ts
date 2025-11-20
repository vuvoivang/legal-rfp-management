import jwt from "jsonwebtoken";
import { IUser } from "../types";

const generateAccessToken = (user: IUser) => {
  const privateKey = process.env.JWT_SECRET || "";
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    privateKey,
    {
      expiresIn: "30m",
    }
  );
};

const generateRefreshToken = (user: IUser) => {
  const privateKey = process.env.REFRESH_SECRET || "";
  return jwt.sign(
    {
      id: user._id,
      version: user.refreshTokenVersion,
    },
    privateKey,
    {
      expiresIn: "30d",
    }
  );
};

const verifyRefreshToken = (token: string) => {
  const privateKey = process.env.REFRESH_SECRET || "";
  return jwt.verify(token, privateKey);
};

const verifyAccessToken = (token: string) => {
  const privateKey = process.env.JWT_SECRET || "";
  return jwt.verify(token, privateKey);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
