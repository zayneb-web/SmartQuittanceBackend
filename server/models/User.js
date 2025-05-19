import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    phoneNumber: {
      type: String,
      required: true,
      min: 8,
    },
    city: String,
    state: String,
    country: String,
    occupation: String,
    transactions: Array,
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN_ABSHORE", // Peut tout gérer
        "ADMIN_ABSHORE", // Gère les responsables entreprise et finance
        "COMPANY_MANAGER", // Gère les utilisateurs de son entreprise
        "FINANCE_COMPANY_MANAGER", // Gère la finance de son entreprise
        "ADMIN_AGENCY", // Gère tous les agents de son agence
        "AGENT", // Utilisateur de base
      ],
      required: true,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Référence vers l'utilisateur qui gère cet utilisateur
    },
    managedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true, // pour soft delete
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
