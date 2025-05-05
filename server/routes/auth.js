import express from "express";
import {
  signupAdminAbshore,
  loginAdminAbshore,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signupAdminAbshore);
router.post("/login", loginAdminAbshore);

export default router;
