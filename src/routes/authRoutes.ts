import express from "express";

import { login, logout, refreshToken } from "../controllers/authController";
import { register } from "../controllers/organisationController";

const router = express.Router();

router.post("/login", login);

router.get("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/register", register);

export default router;
