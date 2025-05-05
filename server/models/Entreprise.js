import mongoose from "mongoose";

const EntrepriseSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  logo: { type: String },
  email: { type: String },
  telephone: { type: String },
  statut: { type: String, enum: ["actif", "inactif"], default: "actif" },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Entreprise = mongoose.model("Entreprise", EntrepriseSchema);
export default Entreprise;
