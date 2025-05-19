import mongoose from "mongoose";
import { StatutLicence } from "./status.js";

const LicenceSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  type: { type: String, required: true }, // ex: "mensuelle", "annuelle"

  statut: {
    type: String,
    enum: StatutLicence,
    default: "en_attente",
  },

  payee: { type: Boolean, default: false },

  dateCreation: { type: Date, default: Date.now }, // quand la licence est créée (après validation de la demande)
  dateValidation: { type: Date }, // quand l'admin la valide
  datePaiement: { type: Date }, // quand le paiement est effectué
  dateExpiration: { type: Date }, // calculée selon le type de licence
  dateAnnulation: { type: Date }, // si jamais la licence est annulée

  commentaire: { type: String },
});

const Licence = mongoose.model("Licence", LicenceSchema);
export default Licence;
