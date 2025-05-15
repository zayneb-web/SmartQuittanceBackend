import ac from "../config/accessControl.js";

export default function checkPermission(action, resource) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const permission = ac.can(user.role)[action](resource);
    if (!permission.granted) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
}
