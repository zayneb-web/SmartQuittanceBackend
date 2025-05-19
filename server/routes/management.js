import express from "express";
import {
  // getAdmins,
  // getUserPerformance,
  addAdminAbshore,
  getAdminAbshoreById,
  getAdminsAbshore,
  getSuperAdminAbshoreById,
  addAgent,
  getAgents,
  getAgentById,
} from "../controllers/management.js";
import {
  addCompanyManager,
  getCompanyManagers,
  addCompany,
  getCompanys,
  getCompanysWithFlag,
  addAgency,
  getAgencies,
  addFinanceManager,
  getFinanceManagers,
  getCompanyManagerById,
  getFinanceManagerById,
  addAdminAgency,
  getAdminAgencyById,
  getAdminAgencies,
} from "../controllers/management.js";
import { verifyToken } from "../middleware/authentification.js";

const router = express.Router();

// Routes for Super Admin Abshore
router.get("/super-admin-abshore/:id", verifyToken, getSuperAdminAbshoreById);

// Routes for Admin Abshore
router.post("/admin-abshore", verifyToken, addAdminAbshore);
router.get("/admin-abshore/:id", verifyToken, getAdminAbshoreById);
router.get("/admins-abshore", verifyToken, getAdminsAbshore);

// Routes avec vérification directe dans le contrôleur
// router.get("/admins", verifyToken, getAdmins);
// router.get("/performance/:id", verifyToken, getUserPerformance);
router.post("/addcompanymanager", verifyToken, addCompanyManager);
router.get("/companymanagers", verifyToken, getCompanyManagers);
router.post("/addcompany", verifyToken, addCompany);
router.get("/companies", verifyToken, getCompanys);
router.get("/companies-with-flag", verifyToken, getCompanysWithFlag);
router.post("/addfinancemanager", verifyToken, addFinanceManager);
router.get("/financemanagers", verifyToken, getFinanceManagers);
router.post("/addagency", verifyToken, addAgency);
router.post("/addadminagency", verifyToken, addAdminAgency);
router.get("/agencies", verifyToken, getAgencies);
router.get("/companymanager/:id", verifyToken, getCompanyManagerById);
router.get("/financemanager/:id", verifyToken, getFinanceManagerById);
router.get("/adminagency/:id", verifyToken, getAdminAgencyById);
router.get("/adminagencies", verifyToken, getAdminAgencies);
router.post("/addagent", verifyToken, addAgent);
router.get("/agents", verifyToken, getAgents);
router.get("/agent/:id", verifyToken, getAgentById);
export default router;
