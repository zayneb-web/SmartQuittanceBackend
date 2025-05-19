import mongoose from "mongoose";
import { StatutDemande } from "./status.js";

const DemandeLicenceSchema = new mongoose.Schema({
  entreprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  typeDemande: { type: String, required: true }, // ex: "annuelle", "mensuelle"

  statut: {
    type: String,
    enum: StatutDemande,
    default: "en_attente",
  },

  dateDemande: { type: Date, default: Date.now }, // quand la demande est envoyée
  dateValidation: { type: Date }, // si validée
  dateRejet: { type: Date }, // si rejetée

  commentaire: { type: String },
});

const DemandeLicence = mongoose.model("DemandeLicence", DemandeLicenceSchema);
export default DemandeLicence;
