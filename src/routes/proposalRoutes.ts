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
router.get("/rfp/:rfpId", listProposalsByRfp);

router.get("/:id", getProposal);
router.patch("/:id", updateProposal);
router.delete("/:id", deleteProposal);

router.post("/:id/accept", acceptProposal);

export default router;
