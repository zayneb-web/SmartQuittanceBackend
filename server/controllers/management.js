import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Company from "../models/Company.js";
import Agency from "../models/Agency.js";
import ac from "../config/accessControl.js";
import bcrypt from "bcryptjs";

// for abshore's management

export const getSuperAdminAbshoreById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is Super Admin Abshore or viewing their own profile
    if (req.user.role !== "SUPER_ADMIN_ABSHORE") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Find the super admin by ID
    const admin = await User.findOne({
      _id: id,
      role: "SUPER_ADMIN_ABSHORE",
    }).select("-password");

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Super Admin Abshore non trouvé" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAdminAbshore = async (req, res) => {
  try {
    if (!ac.can(req.user.role).createAny("admin-abshore").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, city, state, country } =
      req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminAbshore = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      city,
      state,
      country,
      role: "ADMIN_ABSHORE",
      managedBy: req.user._id,
    });

    await adminAbshore.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { managedUsers: adminAbshore._id },
    });

    const adminWithoutPassword = await User.findById(adminAbshore._id).select(
      "-password"
    );

    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminAbshoreById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      req.user.role !== "SUPER_ADMIN_ABSHORE" &&
      req.user.role !== "ADMIN_ABSHORE"
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const admin = await User.findOne({
      _id: id,
      role: "ADMIN_ABSHORE",
    }).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin Abshore non trouvé" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminsAbshore = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN_ABSHORE") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const admins = await User.find({
      role: "ADMIN_ABSHORE",
      isActive: true,
    }).select("-password");

    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getAdmins = async (req, res) => {
//   try {
//     // Vérification permission pour lire "user"
//     if (!ac.can(req.user.role).read("user").granted) {
//       return res.status(403).json({ message: "Accès refusé" });
//     }

//     const admins = await User.find({ role: "admin" }).select("-password");
//     res.status(200).json(admins);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

// export const getUserPerformance = async (req, res) => {
//   try {
//     // Vérification permission pour lire "user"
//     if (!ac.can(req.user.role).read("user").granted) {
//       return res.status(403).json({ message: "Accès refusé" });
//     }

//     const { id } = req.params;

//     const userWithStats = await User.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(id) } },
//       {
//         $lookup: {
//           from: "affiliatestats",
//           localField: "_id",
//           foreignField: "userId",
//           as: "affiliateStats",
//         },
//       },
//       { $unwind: "$affiliateStats" },
//     ]);

//     const saleTransactions = await Promise.all(
//       userWithStats[0].affiliateStats.affiliateSales.map((id) => {
//         return Transaction.findById(id);
//       })
//     );
//     const filteredSaleTransactions = saleTransactions.filter(
//       (transaction) => transaction !== null
//     );

//     res
//       .status(200)
//       .json({ user: userWithStats[0], sales: filteredSaleTransactions });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

export const addCompany = async (req, res) => {
  try {
    if (!ac.can(req.user.role).create("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { nom, logo, email, telephone, statut } = req.body;
    const newCompany = new Company({
      nom,
      logo,
      email,
      telephone,
      statut,
      createdBy: req.user._id,
    });

    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 //for company's management
export const addCompanyManager = async (req, res) => {
  try {
    if (
      !ac.can(req.user.role).create("user").granted &&
      !ac.can(req.user.role).create("company-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, companyId } = req.body;
    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ message: "Company non trouvée" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const responsable = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "COMPANY_MANAGER",
      company: companyId,
      createdBy: req.user._id,
    });

    await responsable.save();

    await Company.findByIdAndUpdate(companyId, {
      $push: { managers: responsable._id },
    });

    res.status(201).json(responsable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompanyManagers = async (req, res) => {
  try {
    if (!ac.can(req.user.role).read("user").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const responsables = await User.find({
      role: "COMPANY_MANAGER",
    }).populate("company");
    res.json(responsables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompanyManagerById = async (req, res) => {
  try {
    if (!ac.can(req.user.role).read("user").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { id } = req.params;

    const companyManager = await User.findOne({
      _id: id,
      role: "COMPANY_MANAGER",
    })
      .populate("company")
      .select("-password");

    if (!companyManager) {
      return res
        .status(404)
        .json({ message: "Responsable d'entreprise non trouvé" });
    }

    res.status(200).json(companyManager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFinanceManagerById = async (req, res) => {
  try {
    // Vérification permission pour lire "user"
    if (
      !ac.can(req.user.role).read("user").granted &&
      !ac.can(req.user.role).read("finance-company-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { id } = req.params;

    // Find the finance manager by ID
    const financeManager = await User.findOne({
      _id: id,
      role: "FINANCE_COMPANY_MANAGER",
    })
      .populate("company")
      .select("-password");

    if (!financeManager) {
      return res
        .status(404)
        .json({ message: "Responsable financier non trouvé" });
    }

    res.status(200).json(financeManager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompanys = async (req, res) => {
  try {
    // Vérification permission pour lire "company" (own ou any selon le rôle)
    const permission = ac.can(req.user.role).read("company");
    if (!permission.granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Si permission "own", filtrer par createdBy
    let query = {};
    if (permission.attributes.includes("own")) {
      query = { createdBy: req.user._id };
    }

    const companies = await Company.find(query);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompanysWithFlag = async (req, res) => {
  try {
    // Vérification permission pour lire "company"
    if (!ac.can(req.user.role).read("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const companies = await Company.find().populate("createdBy", "name email");
    const companiesWithFlag = companies.map((company) => ({
      ...company.toObject(),
      isMine: company.createdBy && company.createdBy._id.equals(req.user._id),
    }));
    res.json(companiesWithFlag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addFinanceManager = async (req, res) => {
  try {
    if (
      !ac.can(req.user.role).create("user").granted &&
      !ac.can(req.user.role).create("finance-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, companyId } = req.body;

    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ message: "Entreprise non trouvée" });

    const financeManager = new User({
      name,
      email,
      password,
      phoneNumber,
      role: "FINANCE_COMPANY_MANAGER",
      company: companyId,
      createdBy: req.user._id,
    });

    await financeManager.save();

    await Company.findByIdAndUpdate(companyId, {
      $push: { financeManagers: financeManager._id },
    });

    res.status(201).json(financeManager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFinanceManagers = async (req, res) => {
  try {
    if (
      !ac.can(req.user.role).read("user").granted &&
      !ac.can(req.user.role).read("finance-company-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const financeManagers = await User.find({
      role: "FINANCE_COMPANY_MANAGER",
    }).populate("company");
    res.json(financeManagers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// for agency's management

export const addAgency = async (req, res) => {
  try {
    // Vérification permission pour créer "agency"
    if (!ac.can(req.user.role).create("agency").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, code, address, contact, managerId } = req.body;

    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== "COMPANY_MANAGER") {
        return res.status(400).json({
          message: "Le manager doit avoir le rôle COMPANY_MANAGER",
        });
      }
    }
    const agency = new Agency({
      name,
      code,
      address,
      contact,
      companyManager: managerId || null,
      createdBy: req.user._id,
    });

    await agency.save();
    if (managerId) {
      await User.findByIdAndUpdate(managerId, { agency: agency._id });
    }

    res.status(201).json(agency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAgencies = async (req, res) => {
  try {
    // Vérification permission pour lire "agency"
    if (!ac.can(req.user.role).read("agency").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const agencies = await Agency.find()
      .populate("manager", "name email")
      .populate("createdBy", "name email");
    res.json(agencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAdminAgency = async (req, res) => {
  try {
    // Vérification permission : seulement ADMIN_ABSHORE ou COMPANY_MANAGER
    if (
      req.user.role !== "ADMIN_ABSHORE" &&
      req.user.role !== "COMPANY_MANAGER"
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, agencyId } = req.body;

    // Vérifier que l'agence existe
    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ message: "Agence non trouvée" });

    // Vérifier que l'email n'est pas déjà utilisé
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin d'agence
    const adminAgency = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "ADMIN_AGENCY",
      adminAgency: agencyId,
      createdBy: req.user._id,
    });

    await adminAgency.save();

    // Lier l'admin d'agence à l'agence (champ adminAgency)
    await Agency.findByIdAndUpdate(agencyId, {
      $set: { adminAgency: adminAgency._id },
    });

    // Retourner l'utilisateur sans le mot de passe
    const adminWithoutPassword = await User.findById(adminAgency._id).select(
      "-password"
    );

    res.status(201).json(adminWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminAgencies = async (req, res) => {
  try {
    // Vérification permission pour lire "user"
    if (
      !ac.can(req.user.role).read("user").granted &&
      !ac.can(req.user.role).read("admin-agency").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const adminAgencies = await User.find({
      role: "ADMIN_AGENCY",
    })
      .populate("agency")
      .select("-password");
    res.status(200).json(adminAgencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminAgencyById = async (req, res) => {
  try {
    if (
      !ac.can(req.user.role).read("user").granted &&
      !ac.can(req.user.role).read("admin-agency").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    const { id } = req.params;
    const adminAgency = await User.findOne({
      _id: id,
      role: "ADMIN_AGENCY",
    })
      .populate("agency")
      .select("-password");
    if (!adminAgency) {
      return res.status(404).json({ message: "Admin d'agence non trouvé" });
    }
    res.status(200).json(adminAgency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAgent = async (req, res) => {
  try {
    if (
      !["ADMIN_AGENCY", "COMPANY_MANAGER", "ADMIN_ABSHORE"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, agencyId } = req.body;

    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ message: "Agence non trouvée" });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "AGENT",
      agency: agencyId,
      createdBy: req.user._id,
    });

    await agent.save();

    await Agency.findByIdAndUpdate(agencyId, {
      $push: { agents: agent._id },
    });

    const agentWithoutPassword = await User.findById(agent._id).select(
      "-password"
    );
    res.status(201).json(agentWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    if (
      !["ADMIN_AGENCY", "COMPANY_MANAGER", "ADMIN_ABSHORE"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { agencyId } = req.query;
    let filter = { role: "AGENT" };
    if (agencyId) filter.agency = agencyId;

    const agents = await User.find(filter)
      .populate("agency")
      .select("-password");
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAgentById = async (req, res) => {
  try {
    if (
      !["ADMIN_AGENCY", "COMPANY_MANAGER", "ADMIN_ABSHORE"].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { id } = req.params;
    const agent = await User.findOne({ _id: id, role: "AGENT" })
      .populate("agency")
      .select("-password");
    if (!agent) {
      return res.status(404).json({ message: "Agent non trouvé" });
    }
    res.status(200).json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
