import express from "express";
import { getAdmins, getUserPerformance } from "../controllers/management.js";
import {
  addResponsableEntreprise,
  getResponsablesEntreprise,
  addEntreprise,
  getEntreprises,
  getEntreprisesWithFlag,
} from "../controllers/management.js";
import { verifyToken, isAdminAbshore } from "../middleware/authentification.js";
const router = express.Router();

router.get("/admins", getAdmins);
router.get("/performance/:id", getUserPerformance);
router.post("/addresponsable", verifyToken, isAdminAbshore, addResponsableEntreprise);
router.get("/responsables", verifyToken, isAdminAbshore, getResponsablesEntreprise);
router.post("/addentreprise", verifyToken, isAdminAbshore, addEntreprise);
router.get("/entreprises", verifyToken, isAdminAbshore, getEntreprises);
router.get("/entreprises-with-flag", verifyToken, isAdminAbshore, getEntreprisesWithFlag);
export default router;
