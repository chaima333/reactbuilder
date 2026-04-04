// user.service.ts
import { User } from "../models";

// Récupérer utilisateur par email
export const getUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

// Ajouter un utilisateur
export const addUser = async (
  name: string,
  email: string,
  password: string,
  role: "Admin" | "Editor" | "Viewer" = "Viewer", // valeur par défaut
  isApproved: boolean = false
) => {
  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password; // déjà hashé avec bcrypt
  user.role = role;
  user.isApproved = isApproved;

  return await user.save(); // Sequelize crée id, createdAt, updatedAt automatiquement
};

// Approuver un utilisateur
export const approveUser = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');
  await user.update({ isApproved: true });
  return user;
};

// Récupérer tous les utilisateurs en attente d'approbation
export const getPendingUsers = async () => {
  return await User.findAll({
    where: { isApproved: false },
    attributes: { exclude: ['password'] },
  });
};