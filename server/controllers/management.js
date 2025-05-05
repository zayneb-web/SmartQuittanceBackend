import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Entreprise from "../models/Entreprise.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
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
    const { name, email, password, phoneNumber, companyId, entrepriseId } =
      req.body;

    // Vérifier que l'entreprise existe
    const entreprise = await Entreprise.findById(companyId);
    if (!entreprise)
      return res.status(404).json({ message: "Entreprise non trouvée" });

    // Créer le responsable
    const responsable = new User({
      name,
      email,
      password, // (à hasher en vrai projet !)
      phoneNumber,
      role: "RESPONSABLE_ENTREPRISE",
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
    const responsables = await User.find({
      role: "RESPONSABLE_ENTREPRISE",
    }).populate("company");
    res.json(responsables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.find({ createdBy: req.user._id });
    res.json(entreprises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEntreprisesWithFlag = async (req, res) => {
  try {
    const entreprises = await Entreprise.find().populate("createdBy", "name email");
    const entreprisesWithFlag = entreprises.map(ent => ({
      ...ent.toObject(),
      isMine: ent.createdBy && ent.createdBy._id.equals(req.user._id)
    }));
    res.json(entreprisesWithFlag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
