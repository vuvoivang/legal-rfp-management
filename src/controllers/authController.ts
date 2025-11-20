import { Response, Request } from "express";

import z from "zod";
import { failure, success } from "../utils";
import { loginBodyValidationSchema } from "../validators/authValidators";
import User from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const query = loginBodyValidationSchema.parse(req.body);
    const { email, password } = query;

    // find user with email

    const user = await User.findOne({ email });

    if (!user) return failure(res, "Invalid email", 400);

    // compare with stored hashed PW
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return failure(res, "Invalid login information", 400);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // for security, long-lived token (refresh) should be stored in cookie
    // Prevent CSRF, XSS to stole
    // BE control access: no JS code access, only via HTTP
    // Do not let FE control and store (like local/session storage)

    // set secure HttpOnly cookie
    res.cookie("jid", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh-token",
    });

    // Access token auto-refreshes silently for 30 days
    // FE fetch API, if error 401 in middleware, call API /refresh-token to invalidate access token
    // then retry the original API

    // When returned access token is empty, it's time to re login
    // FE redirect user to login page
    return success(
      res,
      {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
        },
      },
      200
    );
  } catch (err) {
    console.log("Error login: ", err);

    if (err instanceof z.ZodError) {
      return failure(res, "Invalid body request", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenFromCookie = req.cookies.jid;

    if (!refreshTokenFromCookie)
      return failure(res, "Invalid refresh token", 401);

    let payload: any = null;
    try {
      payload = verifyRefreshToken(refreshTokenFromCookie) as JwtPayload;
    } catch (err) {
      // expired, malformed, signature invalid...
      return failure(res, "Invalid refresh token", 401);
    }

    // match user
    const user = await User.findById(payload.id);

    if (!user) return failure(res, "Invalid refresh token", 401);

    // match version -> revoke if not
    if (payload.refreshTokenVersion !== user.refreshTokenVersion) {
      return failure(res, "Invalid refresh token", 401);
    }

    const accessToken = generateAccessToken(user);

    // should rotate refreshToken
    // to prevent stolen token stays valid forever
    const refreshToken = generateRefreshToken(user);

    res.cookie("jid", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh-token",
    });

    return success(
      res,
      {
        accessToken,
      },
      200
    );
  } catch (err) {
    console.log("Error refresh token: ", err);

    return failure(res, "Internal Server Error", 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // already passed auth middleware
    // must match exact config to clear
    res.clearCookie("jid", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/auth/refresh-token",
    });

    const user = req.user;

    // access token will naturally expire soon
    // we do not store anything related to it (stateless)
    // if biz need, we can store a server blacklist of JWTs in Redis - not encouraged because each API needs Redis lookup - slow
    await User.findByIdAndUpdate(user?._id, {
      $inc: { refreshTokenVersion: 1 },
    });

    return success(res, null, 200);
  } catch (err) {
    console.log("Error log out: ", err);
    return failure(res, "Internal Server Error", 500);
  }
};
