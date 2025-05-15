import express from "express";
import { getAdmins, getUserPerformance } from "../controllers/management.js";
import {
  addResponsableEntreprise,
  getResponsablesEntreprise,
  addEntreprise,
  getEntreprises,
  getEntreprisesWithFlag,
  addAgency,
  getAgencies,
} from "../controllers/management.js";
import { verifyToken } from "../middleware/authentification.js";

const router = express.Router();

// Routes avec vérification directe dans le contrôleur
router.get("/admins", verifyToken, getAdmins);
router.get("/performance/:id", verifyToken, getUserPerformance);

router.post("/addresponsable", verifyToken, addResponsableEntreprise);

router.get("/responsables", verifyToken, getResponsablesEntreprise);

router.post("/addentreprise", verifyToken, addEntreprise);

router.get("/entreprises", verifyToken, getEntreprises);

router.get("/entreprises-with-flag", verifyToken, getEntreprisesWithFlag);

router.post("/addagency", verifyToken, addAgency);
router.get("/agencies", verifyToken, getAgencies);

export default router;
