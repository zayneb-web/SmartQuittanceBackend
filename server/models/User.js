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
      min:8
    },
    city: String,
    state: String,
    country: String,
    occupation: String,
    transactions: Array,
    role: {
      type: String,
      enum: ['ADMIN_ABSHORE', 'RESPONSABLE_ENTREPRISE', 'AGENT'],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
      default: null // null pour les AdminAbshore
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true // pour soft delete
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
