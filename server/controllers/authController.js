import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupAdminAbshore = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "ADMIN_ABSHORE",
      company: null,
    });

    await user.save();
    res.status(201).json({ message: "AdminAbshore créé avec succès", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginAdminAbshore = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: "ADMIN_ABSHORE" });
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mot de passe incorrect" });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Mets une clé secrète dans ton .env
      { expiresIn: "1d" }
    );

    res.json({ message: "Connexion réussie", user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
