import express from "express";
import {
  signupSuperAdminAbshore,
  loginSuperAdminAbshore,
  login,
} from "../controllers/authController.js";
const router = express.Router();

// Route pour la création d'utilisateurs initiaux (Super Admin)
router.post("/signup", signupSuperAdminAbshore);

// Route de login pour Super Admin Abshore
router.post("/login/superadmin", loginSuperAdminAbshore);

// Route de login universelle (détecte automatiquement le rôle)
router.post("/login", login);

export default router;
