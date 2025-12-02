import { Request, Response } from "express";
import Proposal from "../models/Proposal";
import { success, failure } from "../utils";
import { createAuditLog } from "../utils/audit";
import {
  createProposalSchema,
  updateProposalSchema,
} from "../validators/proposalValidators";
import AuditLog from "../models/AuditLog";

export const createProposal = async (req: Request, res: Response) => {
  try {
    const body = createProposalSchema.parse(req.body);
    if (!req.user) return failure(res, "Unauthenticated user", 401);

    const proposal = await Proposal.create({
      ...body,
      createdBy: req.user._id,
      organisationId: req.user.organisationId,
      status: "SUBMITTED"
    });

    await createAuditLog({
      entity: "PROPOSAL",
      entityId: proposal.id,
      action: "CREATE",
      performedBy: req.user.id,
      changes: body,
    });

    return success(res, proposal, 201);
  } catch (err) {
    return failure(res, "Failed to create proposal", 500);
  }
};

export const getProposal = async (req: Request, res: Response) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return failure(res, "Proposal not found", 404);

    return success(res, proposal);
  } catch {
    return failure(res, "Internal Server Error", 500);
  }
};

export const updateProposal = async (req: Request, res: Response) => {
  try {
    const old = await Proposal.findById(req.params.id);
    if (!req.user) return failure(res, "Unauthenticated user", 401);

    if (!old) return failure(res, "Proposal not found", 404);

    const body = updateProposalSchema.parse(req.body);

    const updated = await Proposal.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    await createAuditLog({
      entity: "PROPOSAL",
      entityId: req.params.id,
      action: "UPDATE",
      performedBy: req.user.id,
      changes: { before: old, after: updated },
    });

    return success(res, updated);
  } catch {
    return failure(res, "Failed to update proposal", 500);
  }
};

export const deleteProposal = async (req: Request, res: Response) => {
  try {
    const deleted = await Proposal.findByIdAndDelete(req.params.id);
    if (!req.user) return failure(res, "Unauthenticated user", 401);

    await createAuditLog({
      entity: "PROPOSAL",
      entityId: req.params.id,
      action: "DELETE",
      performedBy: req.user.id,
    });

    return success(res, deleted);
  } catch {
    return failure(res, "Failed to delete proposal", 500);
  }
};

export const listProposalsByRfp = async (req: Request, res: Response) => {
  try {
    const { rfpId } = req.params;

    const proposals = await Proposal.find({ rfp: rfpId })
      .populate("createdBy", "name email")
      .populate("organisation", "name");

    return res.json({
      success: true,
      data: proposals,
    });
  } catch {
    return failure(res, "Failed to delete proposal", 500);
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const proposal = await Proposal.findById(id);
    if (!proposal) return failure(res, "Proposal not found", 404);

    proposal.status = "ACCEPTED";
    await proposal.save();

    await createAuditLog({
      entity: "PROPOSAL",
      entityId: proposal.id,
      action: "ACCEPT",
      performedBy: userId,
      changes: "Proposal accepted by user",
    });

    return res.json({
      success: true,
      message: "Proposal accepted successfully",
      data: proposal,
    });
  } catch (err) {
    console.log('Error accept proposal', err);
    return failure(res, "Failed to accept proposal", 500);
  }
};
