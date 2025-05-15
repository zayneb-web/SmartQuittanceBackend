import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    logo: { type: String },
    email: { type: String },
    telephone: { type: String },

    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },

    contact: {
      email: { type: String },
      phone: { type: String },
    },

    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Company managers
      },
    ],

    financeManagers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Financial managers
      },
    ],

    agencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agency",
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);
export default Company;
