// src/routes/organisation.routes.ts
import { Router } from "express";
import {
  addMemberToOrg,
  getOrganisation,
  getListOrganisationUsers,
  register,
} from "../controllers/organisationController";

const router = Router();

router.post("organisations/:orgId/members", addMemberToOrg);
router.get("organisations/:orgId", getOrganisation);
router.get("organisations/:orgId/users", getListOrganisationUsers);

export default router;
