import express from "express";
import {
  createComment,
  deleteComment,
  listComments,
} from "../controllers/commentController";

const router = express.Router();

router.get("/rfps", listComments);
router.post("/rfps", createComment);
router.delete("/rfps/:id", deleteComment);

export default router;
