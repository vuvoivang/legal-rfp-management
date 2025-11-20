import { Response, Request } from "express";
import Rfp from "../models/Rfp";
import {
  createRfpValidationSchema,
  getRfpsQueryValidationSchema,
  updateRfpValidationSchema,
} from "../validators/rfpValidators";
import z from "zod";
import { failure, success } from "../utils";
import mongoose from "mongoose";
import { MONGODB_DUPLICATED_ERROR_CODE } from "../utils/constant";

export const getRfps = async (req: Request, res: Response) => {
  try {
    const query = getRfpsQueryValidationSchema.parse(req.query);
    const {
      status,
      search,
      minBudget,
      maxBudget,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    // dynamic filter
    const filter: any = {};

    if (status) filter.status = status;

    // search filter (title/description)

    // regex search: slower for large texts - scan all documents
    // if (search) {
    //   const regex = new RegExp(search, "i"); // case-insensitive
    //   filter.$or = [{ title: regex }, { description: regex }];
    // }

    // Search indexed tokens
    // fast & support ranking results by relevance (e.g, by word frequency)
    if (search) {
      filter.$text = { $search: search };
    }

    if (minBudget || maxBudget) {
      // exception: '0' number => isNil check
      filter.budget = {
        ...(minBudget ? { $gte: minBudget } : {}),
        ...(maxBudget ? { $lte: maxBudget } : {}),
      };
    }

    if (startDate || endDate) {
      filter.dueDate = {
        ...(startDate ? { $gte: new Date(startDate) } : {}),
        ...(endDate ? { $lte: new Date(endDate) } : {}),
      };
    }

    // pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query with total count
    const [rfps, total] = await Promise.all([
      Rfp.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 }) // descending priority
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Rfp.countDocuments(filter),
    ]);

    return success(
      res,
      {
        items: rfps,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      200
    );
  } catch (err) {
    console.log("Error fetching RFPs: ", err);

    if (err instanceof z.ZodError) {
      return failure(res, "Invalid query parameters request", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};

export const createRfp = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description = "",
      budget,
      due_date,
    } = createRfpValidationSchema.parse(req.body);
    const user = req.user;

    // prevent duplicate
    const existingRfp = await Rfp.findOne({
      title,
      createdBy: user!.id,
    });

    // also add unique constraint at DB level
    if (existingRfp) {
      return failure(
        res,
        "An RFP with this title and budget already exists for this user",
        400
      );
    }

    // Atomicity
    // Expansion: if multiple writes need to be in-ordered and successful together
    // Can wrap in transaction: all succeed or rollback
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // try {
    //   // write Rfp table
    //   // write Proposal table
    //   // write AuditLog table
    // } catch (e) {}
    // session.commitTransaction();
    // session.endSession();

    // If very high contention scenarios
    // can use in-memory lock - Mutex
    // Only one concurrent run at a time

    const rfp = new Rfp({
      title,
      status: "SUBMITTED",
      description,
      budget,
      dueDate: due_date,
      createdBy: user!.id,
    });

    const createdRfp = await rfp.save();

    // idempotent?
    // race condition?
    // => Index mark Unique by { title, createdBy }
    return success(res, { rfp_id: createdRfp.id }, 201);
  } catch (err) {
    console.error("Error creating RFP:", err);
    if (err instanceof z.ZodError) {
      return failure(res, "Invalid body request", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};

export const updateRfp = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Validate id
    if (!id || !mongoose.isValidObjectId(id)) {
      return failure(res, "Invalid or missing RFP id", 400);
    }
    const validatedBody = updateRfpValidationSchema.parse(req.body);

    // Idempotent-safe update
    // If same request sent multiple times, result is the same (no duplication or race condition)
    // Uses atomic MongoDB operation - findByIdAndUpdate
    const updatedRfp = await Rfp.findByIdAndUpdate(
      id,
      { $set: validatedBody },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedRfp) return failure(res, "RFP not found", 404);

    return success(res, updatedRfp, 200);
  } catch (err) {
    console.log("Error updating RFP: ", err);

    if (err instanceof z.ZodError) {
      return failure(res, "Invalid body request", 400);
    }

    if ((err as any).code === MONGODB_DUPLICATED_ERROR_CODE) {
      return failure(res, "Duplicate RFP title for this user", 400);
    }
    return failure(res, "Internal Server Error", 500);
  }
};

export const deleteRfp = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Validate id
    if (!id || !mongoose.isValidObjectId(id)) {
      return failure(res, "Invalid or missing RFP id", 400);
    }

    // prevent deleting twice
    // idempotent: won't corrupt data when retrying many times => same result
    // the same result in DB no matter how many times we call identical requests
    const updatedRfp = await Rfp.findOneAndUpdate(
      { _id: id, status: { $ne: "DELETED" } }, // only delete if not already deleted
      { $set: { status: "DELETED" } },
      { new: true }
    );

    if (!updatedRfp) return failure(res, "RFP not found or already deleted", 404);

    return success(res, 200);
  } catch (err) {
    console.log("Error updating RFP: ", err);
    return failure(res, "Internal Server Error", 500);
  }
};
