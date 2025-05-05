import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide" });
  }
};

export const isAdminAbshore = (req, res, next) => {
  if (req.user.role !== "ADMIN_ABSHORE") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};