import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupSuperAdminAbshore = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, photo } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "SUPER_ADMIN_ABSHORE",
      company: null,
      photo: photo || "",
    });

    await user.save();
    res.status(201).json({ message: "AdminAbshore créé avec succès", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginSuperAdminAbshore = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "SUPER_ADMIN_ABSHORE" });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );

    res.json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login universel pour tous les utilisateurs
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur par email sans spécifier le rôle
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({ message: "Compte désactivé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    // Générer le token JWT avec le rôle de l'utilisateur
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = await User.findById(user._id)
      .select("-password")
      .populate("company")
      .populate("agency");

    res.json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
