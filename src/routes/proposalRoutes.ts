// src/routes/proposal.routes.ts
import { Router } from "express";
import {
  createProposal,
  getProposal,
  updateProposal,
  deleteProposal,
  listProposalsByRfp,
  acceptProposal,
} from "../controllers/proposalController";

const router = Router();

router.post("/", createProposal);
router.get("/rfps/:rfpId", listProposalsByRfp);

router.get("/:id", getProposal);
router.patch("/:id", updateProposal);
router.post("/:id/accept", acceptProposal);

router.delete("/:id", deleteProposal);

export default router;
