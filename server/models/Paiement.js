import mongoose from "mongoose";

const PaiementSchema = new mongoose.Schema({
  licence: { type: mongoose.Schema.Types.ObjectId, ref: "Licence" },
  montant: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  justificatif: String,
});

const Paiement = mongoose.model("Paiement", PaiementSchema);
export default Paiement;
