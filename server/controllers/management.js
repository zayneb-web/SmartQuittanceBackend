import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Entreprise from "../models/Entreprise.js";
import Agency from "../models/Agence.js";
import ac from "../config/accessControl.js";

export const getAdmins = async (req, res) => {
  try {
    // Vérification permission pour lire "user"
    if (!ac.can(req.user.role).read("user").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    // Vérification permission pour lire "user"
    if (!ac.can(req.user.role).read("user").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { id } = req.params;

    const userWithStats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "affiliatestats",
          localField: "_id",
          foreignField: "userId",
          as: "affiliateStats",
        },
      },
      { $unwind: "$affiliateStats" },
    ]);

    const saleTransactions = await Promise.all(
      userWithStats[0].affiliateStats.affiliateSales.map((id) => {
        return Transaction.findById(id);
      })
    );
    const filteredSaleTransactions = saleTransactions.filter(
      (transaction) => transaction !== null
    );

    res
      .status(200)
      .json({ user: userWithStats[0], sales: filteredSaleTransactions });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addEntreprise = async (req, res) => {
  try {
    // Vérification permission pour créer "company"
    if (!ac.can(req.user.role).create("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { nom, logo, email, telephone, statut } = req.body;
    const entreprise = new Entreprise({
      nom,
      logo,
      email,
      telephone,
      statut,
      createdBy: req.user._id,
    });

    await entreprise.save();
    res.status(201).json(entreprise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addResponsableEntreprise = async (req, res) => {
  try {
    // Vérification permission pour créer "user" ou "company-manager"
    if (
      !ac.can(req.user.role).create("user").granted &&
      !ac.can(req.user.role).create("company-manager").granted
    ) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { name, email, password, phoneNumber, companyId, entrepriseId } =
      req.body;

    // Vérifier que l'entreprise existe
    const entreprise = await Entreprise.findById(companyId);
    if (!entreprise)
      return res.status(404).json({ message: "Entreprise non trouvée" });

    const responsable = new User({
      name,
      email,
      password,
      phoneNumber,
      role: "COMPANY_MANAGER",
      company: companyId,
      entreprise: entrepriseId,
      createdBy: req.user._id,
    });

    await responsable.save();
    res.status(201).json(responsable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getResponsablesEntreprise = async (req, res) => {
  try {
    // Vérification permission pour lire "user"
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

export const getEntreprises = async (req, res) => {
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

    const entreprises = await Entreprise.find(query);
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntreprisesWithFlag = async (req, res) => {
  try {
    // Vérification permission pour lire "company"
    if (!ac.can(req.user.role).read("company").granted) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const entreprises = await Entreprise.find().populate(
      "createdBy",
      "name email"
    );
    const entreprisesWithFlag = entreprises.map((ent) => ({
      ...ent.toObject(),
      isMine: ent.createdBy && ent.createdBy._id.equals(req.user._id),
    }));
    res.json(entreprisesWithFlag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
      manager: managerId || null,
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
