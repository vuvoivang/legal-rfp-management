import { Response, Request } from "express";

import z from "zod";
import { failure, success } from "../utils";
import {
  addMemberSchema,
  registerBodyValidationSchema,
} from "../validators/organisationValidators";
import User from "../models/User";
import bcrypt from "bcryptjs";
import Organisation from "../models/Organisation";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { IUser } from "../types";

export const register = async (req: Request, res: Response) => {
  try {
    const query = registerBodyValidationSchema.parse(req.body);
    const { email, password, confirmedPassword, name, organisationName, organisationRole } =
      query;
    if (password !== confirmedPassword)
      return failure(res, "Password and confirm password does not match", 400);
    const existingOrg = await Organisation.findOne({ name: organisationName });
    if (existingOrg) return failure(res, "Organisation already exists", 400);

    // should retry if fails

    // Create org first
    const organisation = await Organisation.create({
      name: organisationName,
      role: organisationRole,
    });
    if (!organisation) return failure(res, "Can not create organisation", 400);

    const hashedPassword = await bcrypt.hash(
      password,
      process.env.SALT_ROUNDS || ""
    );

    // Create first admin user
    const user: IUser = await User.create({
      email,
      hashedPassword,
      name,
      role: "ADMIN",
      organisationId: organisation._id,
    });
    if (!user) return failure(res, "Can not create this user", 400);

    const accessToken = generateAccessToken(user);
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
        user,
        accessToken,
      },
      200
    );
  } catch (err) {
    console.log("Error sign up: ", err);

    if (err instanceof z.ZodError) {
      return failure(res, "Invalid body request", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};

export const getOrganisation = async (req: Request, res: Response) => {
  try {
    const org = await Organisation.findById(req.user?.organisationId);
    if (!org) return failure(res, "Organisation not found", 404);

    return success(res, org);
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};

export const getListOrganisationUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ organisationId: req.user?.organisationId });

    return success(res, users);
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};

export const addMemberToOrg = async (req: Request, res: Response) => {
  try {
    const body = addMemberSchema.parse(req.body);
    const { email, name, organisationId, role } = body;

    const org = await Organisation.findById(organisationId);
    if (!org) {
      return failure(res, "Organisation not found", 404);
    }

    const existing = await User.findOne({ email, organisationId });
    if (existing)
      return failure(res, "User already exists in this organisation", 400);

    const hashed = await bcrypt.hash(
      process.env.DEFAULT_PASSWORD as string,
      10
    );

    const user = await User.create({
      email,
      name,
      hashedPassword: hashed,
      organisationId,
      role,
    });

    return success(res, user, 201);
  } catch (err) {
    console.log("Error adding member:", err);
    if (err instanceof Error && "issues" in err) {
      return failure(res, "Invalid request body", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};
