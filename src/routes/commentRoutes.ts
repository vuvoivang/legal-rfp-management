import express from "express";
import {
  createComment,
  deleteComment,
  listComments,
} from "../controllers/commentController";

const router = express.Router();

router.get("/", listComments);
router.post("/", createComment);
router.delete("/:id", deleteComment);

export default router;
