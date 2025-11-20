import { Request, Response } from "express";
import Comment from "../models/Comment";
import { success, failure } from "../utils";
import { createCommentSchema } from "../validators/commentValidator";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { entityId, entityType, content } = createCommentSchema.parse(req.body);

    const comment = await Comment.create({
      entityId,
      entityType,
      content,
      createdBy: req.user?._id,
    });

    return success(res, comment, 201);
  } catch (e) {
    return failure(res, "Failed to create comment", 500);
  }
};

export const listComments = async (req: Request, res: Response) => {
  try {
    const { entityId } = req.params;

    const comments = await Comment.find({ entityId }).populate("createdBy", "name email");

    return success(res, comments);
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Comment.findByIdAndDelete(id);

    return success(res, "Comment deleted");
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};
