import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Company from "../models/Company.js";
import Agency from "../models/Agency.js";
import ac from "../config/accessControl.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudInaryConfig.js";

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

    const { name, email, password, phoneNumber, city, state, country, photo } =
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
      photo,
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
    console.log("1. Début de addCompanyManager");
    console.log("2. Vérification des permissions");
    if (
      !ac.can(req.user.role).create("user").granted &&
      !ac.can(req.user.role).create("company-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    console.log("3. Extraction des données de la requête");
    const { name, email, password, phoneNumber, companyId, gender } = req.body;
    const photoFile = req.file; // Fichier photo depuis multer
    console.log("4. Photo file reçu:", photoFile ? "Oui" : "Non");

    console.log("5. Vérification de la company");
    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ message: "Company non trouvée" });

    console.log("6. Hashage du mot de passe");
    const hashedPassword = await bcrypt.hash(password, 10);

    let photoUrl = null;
    // Uploader l'image sur Cloudinary si un fichier est présent
    if (photoFile) {
      try {
        console.log("7. Début de l'upload vers Cloudinary");
        // Convertir le buffer en data URI pour l'upload
        const dataUri = `data:${
          photoFile.mimetype
        };base64,${photoFile.buffer.toString("base64")}`;
        console.log("8. Data URI créé, longueur:", dataUri.length);

        console.log("9. Tentative d'upload vers Cloudinary");
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "company_managers_photos",
        });
        console.log("10. Upload Cloudinary réussi:", uploadResult.secure_url);
        photoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error(
          "11. Erreur détaillée lors de l'upload Cloudinary:",
          uploadError
        );
        return res.status(500).json({
          message: "Erreur lors de l'upload de l'image",
          error: uploadError.message,
        });
      }
    }

    console.log("12. Création du nouvel utilisateur");
    // Créer l'utilisateur avec l'URL de la photo Cloudinary
    const responsable = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "COMPANY_MANAGER",
      company: companyId,
      createdBy: req.user._id,
      photo: photoUrl,
      gender,
    });

    console.log("13. Sauvegarde de l'utilisateur");
    await responsable.save();

    console.log("14. Mise à jour de la company");
    await Company.findByIdAndUpdate(companyId, {
      $push: { managers: responsable._id },
    });

    console.log("15. Envoi de la réponse");
    res.status(201).json(responsable);
  } catch (err) {
    console.error("16. Erreur globale:", err);
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

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({})
      .populate("managers")
      .populate("financeManagers");

    res.status(200).json(companies);
  } catch (error) {
    res.status(404).json({ message: error.message });
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

    const { name, email, password, phoneNumber, companyId, photo } = req.body;

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
      photo,
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

    // Vérification optionnelle du manager si fourni
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== "COMPANY_MANAGER") {
        return res.status(400).json({
          message: "Le manager doit avoir le rôle COMPANY_MANAGER",
        });
      }
    }

    // Création de l'agence (managerId est optionnel)
    const agency = new Agency({
      name,
      code,
      address,
      contact,
      companyManager: managerId || null, // Peut être null si aucun manager n'est assigné
      createdBy: req.user._id,
    });

    await agency.save();

    // Mise à jour du manager si fourni
    if (managerId) {
      await User.findByIdAndUpdate(managerId, { agency: agency._id });
    }

    res.status(201).json({
      message: "Agence créée avec succès",
      agency,
      note: managerId ? "Manager assigné" : "Aucun manager assigné",
    });
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
      .populate({
        path: "companyManager",
        select: "name email company",
        populate: {
          path: "company",
          select: "name nom", // select both 'name' and 'nom' in case your schema uses either
        },
      })
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
      req.user.role !== "COMPANY_MANAGER" &&
      req.user.role !== "SUPER_ADMIN_ABSHORE"
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, agencyId, photo, gender } =
      req.body;
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
      agency: agencyId,
      createdBy: req.user._id,
      photo,
      gender,
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

    const { name, email, password, phoneNumber, agencyId, photo } = req.body;

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
      photo,
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

// Recherche d'agence par nom (recherche partielle insensible à la casse)
export const searchAgenciesByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Le nom est requis" });
    }
    const agencies = await Agency.find({
      name: { $regex: name, $options: "i" },
    });
    res.status(200).json(agencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phoneNumber,
      city,
      state,
      country,
      occupation,
      photo,
      gender,
      about,
      experience,
    } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier si l'utilisateur a le droit de modifier ce profil
    if (req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ message: "Vous ne pouvez modifier que votre propre profil" });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    // Validation des champs
    if (name && (name.length < 2 || name.length > 100)) {
      return res
        .status(400)
        .json({ message: "Le nom doit contenir entre 2 et 100 caractères" });
    }

    if (phoneNumber && phoneNumber.length < 8) {
      return res.status(400).json({
        message: "Le numéro de téléphone doit contenir au moins 8 caractères",
      });
    }

    if (gender && !["male", "female", "other"].includes(gender)) {
      return res
        .status(400)
        .json({ message: "Le genre doit être 'male', 'female' ou 'other'" });
    }

    if (experience !== undefined && (isNaN(experience) || experience < 0)) {
      return res
        .status(400)
        .json({ message: "L'expérience doit être un nombre positif" });
    }

    // Mettre à jour les champs
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (city) updatedFields.city = city;
    if (state) updatedFields.state = state;
    if (country) updatedFields.country = country;
    if (occupation) updatedFields.occupation = occupation;
    if (photo) updatedFields.photo = photo;
    if (gender) updatedFields.gender = gender;
    if (about) updatedFields.about = about;
    if (experience !== undefined) updatedFields.experience = experience;

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "Erreur lors de la mise à jour du profil" });
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Erreur de validation",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("company", "nom logo")
      .populate("agency", "name code")
      .populate("managedBy", "name email role")
      .populate("managedUsers", "name email role");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({
      message: "Utilisateur trouvé avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, logo, email, telephone, statut } = req.body;

    // Vérifier si l'entreprise existe
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    // Vérifier les permissions
    if (!ac.can(req.user.role).update("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Vérifier si l'utilisateur est le créateur de l'entreprise ou un ADMIN_ABSHORE/SUPER_ADMIN_ABSHORE
    if (
      !["ADMIN_ABSHORE", "SUPER_ADMIN_ABSHORE"].includes(req.user.role) &&
      company.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette entreprise",
      });
    }

    // Mettre à jour les champs
    const updatedFields = {};
    if (nom) updatedFields.nom = nom;
    if (logo) updatedFields.logo = logo;
    if (email) updatedFields.email = email;
    if (telephone) updatedFields.telephone = telephone;
    if (statut) updatedFields.statut = statut;

    // Mettre à jour l'entreprise
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Entreprise mise à jour avec succès",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, contact, managerId } = req.body;

    // Vérifier si l'agence existe
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "Agence non trouvée" });
    }

    // Vérifier les permissions
    if (!ac.can(req.user.role).update("agency").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Vérifier si l'utilisateur est le créateur de l'agence ou un ADMIN_ABSHORE/SUPER_ADMIN_ABSHORE
    if (
      !["ADMIN_ABSHORE", "SUPER_ADMIN_ABSHORE"].includes(req.user.role) &&
      agency.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier cette agence",
      });
    }

    // Vérifier le manager si fourni
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== "COMPANY_MANAGER") {
        return res.status(400).json({
          message: "Le manager doit avoir le rôle COMPANY_MANAGER",
        });
      }
    }

    // Mettre à jour les champs
    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (code) updatedFields.code = code;
    if (address) updatedFields.address = address;
    if (contact) updatedFields.contact = contact;
    if (managerId) {
      updatedFields.companyManager = managerId;
      // Mettre à jour le manager
      await User.findByIdAndUpdate(managerId, { agency: id });
    }

    // Mettre à jour l'agence
    const updatedAgency = await Agency.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).populate({
      path: "companyManager",
      select: "name email company",
      populate: {
        path: "company",
        select: "name nom",
      },
    });

    res.status(200).json({
      message: "Agence mise à jour avec succès",
      agency: updatedAgency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    if (!ac.can(req.user.role).delete("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette entreprise",
      });
    }
    await User.updateMany({ company: id }, { $unset: { company: 1 } });
    await Company.findByIdAndDelete(id);

    res.status(200).json({
      message: "Entreprise et ses utilisateurs associés supprimés avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAgency = async (req, res) => {
  try {
    const { id } = req.params;
    const agency = await Agency.findById(id);
    if (!agency) {
      return res.status(404).json({ message: "Agence non trouvée" });
    }
    if (!ac.can(req.user.role).delete("agency").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    // Vérifier si l'utilisateur est le créateur de l'agence ou un ADMIN_ABSHORE/SUPER_ADMIN_ABSHORE
    if (
      !["ADMIN_ABSHORE", "SUPER_ADMIN_ABSHORE"].includes(req.user.role) &&
      agency.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette agence",
      });
    }
    await User.updateMany({ agency: id }, { $unset: { agency: 1 } });
    await Agency.findByIdAndDelete(id);

    res.status(200).json({
      message: "Agence et ses utilisateurs associés supprimés avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (!ac.can(req.user.role).delete("user").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    if (req.user.role === "SUPER_ADMIN_ABSHORE") {
      // Le super admin peut supprimer n'importe quel utilisateur
    } else if (req.user.role === "ADMIN_ABSHORE") {
      // L'admin Abshore ne peut supprimer que les utilisateurs qu'il a créés
      if (user.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les utilisateurs que vous avez créés",
        });
      }
    } else if (req.user.role === "COMPANY_MANAGER") {
      // Le manager d'entreprise ne peut supprimer que les utilisateurs de son entreprise
      if (user.company?.toString() !== req.user.company?.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les utilisateurs de votre entreprise",
        });
      }
    } else if (req.user.role === "ADMIN_AGENCY") {
      // L'admin d'agence ne peut supprimer que les utilisateurs de son agence
      if (user.agency?.toString() !== req.user.agency?.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les utilisateurs de votre agence",
        });
      }
    } else {
      return res.status(403).json({
        message:
          "Vous n'avez pas les permissions nécessaires pour supprimer des utilisateurs",
      });
    }

    // Supprimer les références dans les autres collections
    if (user.role === "COMPANY_MANAGER") {
      await Company.updateMany(
        { managers: user._id },
        { $pull: { managers: user._id } }
      );
    } else if (user.role === "FINANCE_COMPANY_MANAGER") {
      await Company.updateMany(
        { financeManagers: user._id },
        { $pull: { financeManagers: user._id } }
      );
    } else if (user.role === "ADMIN_AGENCY") {
      await Agency.updateMany(
        { adminAgency: user._id },
        { $unset: { adminAgency: 1 } }
      );
    } else if (user.role === "AGENT") {
      await Agency.updateMany(
        { agents: user._id },
        { $pull: { agents: user._id } }
      );
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompanyManager = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe et a le rôle COMPANY_MANAGER
    const manager = await User.findOne({ _id: id, role: "COMPANY_MANAGER" });
    if (!manager) {
      return res
        .status(404)
        .json({ message: "Manager d'entreprise non trouvé" });
    }

    // Vérifier les permissions générales de suppression d'utilisateur
    if (!ac.can(req.user.role).delete("user").granted) {
      return res.status(403).json({
        message:
          "Accès refusé : Vous n'avez pas la permission générale de supprimer des utilisateurs.",
      });
    }

    // Vérifications de permissions spécifiques basées sur le rôle de l'utilisateur qui fait la requête
    if (req.user.role === "ADMIN_ABSHORE") {
      // L'admin Abshore peut supprimer les managers d'entreprise qu'il a créés
      if (manager.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les managers d'entreprise que vous avez créés (Admin Abshore)",
        });
      }
    } else if (req.user.role === "SUPER_ADMIN_ABSHORE") {
      // Le Super Admin Abshore peut supprimer n'importe quel manager d'entreprise
    } else {
      // Les autres rôles ne peuvent pas supprimer de managers d'entreprise via cette route (la route deleteUser gère la suppression de son propre profil)
      return res.status(403).json({
        message:
          "Vous n'avez pas les permissions nécessaires pour supprimer ce manager d'entreprise",
      });
    }

    // Retirer le manager de la liste des managers de l'entreprise associée
    if (manager.company) {
      await Company.findByIdAndUpdate(manager.company, {
        $pull: { managers: manager._id },
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Manager d'entreprise supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdminAgency = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe et a le rôle ADMIN_AGENCY
    const admin = await User.findOne({ _id: id, role: "ADMIN_AGENCY" });
    if (!admin) {
      return res.status(404).json({ message: "Admin d'agence non trouvé" });
    }

    // Vérifier les permissions générales de suppression d'utilisateur
    if (!ac.can(req.user.role).delete("user").granted) {
      return res.status(403).json({
        message:
          "Accès refusé : Vous n'avez pas la permission générale de supprimer des utilisateurs.",
      });
    }

    // Vérifications de permissions spécifiques basées sur le rôle de l'utilisateur qui fait la requête
    if (
      req.user.role === "ADMIN_ABSHORE" ||
      req.user.role === "SUPER_ADMIN_ABSHORE"
    ) {
      // Les Admins Abshore (et Super) peuvent supprimer les admins d'agence qu'ils ont créés
      if (admin.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les admins d'agence que vous avez créés (Admin/Super Admin Abshore)",
        });
      }
    } else if (req.user.role === "COMPANY_MANAGER") {
      // Un manager d'entreprise peut supprimer un admin d'agence s'il a créé l'agence
      // et si l'admin d'agence est bien rattaché à cette agence
      const agency = await Agency.findOne({
        _id: admin.agency,
        createdBy: req.user._id,
      });
      if (!agency) {
        return res.status(403).json({
          message:
            "Vous ne pouvez supprimer que les admins d'agence des agences que vous avez créées (Company Manager)",
        });
      }
    } else {
      // Les autres rôles ne peuvent pas supprimer d'admins d'agence via cette route
      return res.status(403).json({
        message:
          "Vous n'avez pas les permissions nécessaires pour supprimer cet admin d'agence",
      });
    }

    // Retirer la référence de l'admin d'agence dans l'agence associée
    if (admin.agency) {
      await Agency.findByIdAndUpdate(admin.agency, {
        $unset: { adminAgency: 1 },
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "Admin d'agence supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
