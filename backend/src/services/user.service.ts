// user.service.ts
import { User } from "../models";



// Ajouter un utilisateur

export const addUser = async (name: string, email: string, password: string, role: string, isApproved: boolean = false) => {
  return await User.create({ 
    name, 
    email, 
    password, 
    role: role as 'Admin' | 'Editor' | 'Viewer',
    isApproved 
  });
};

export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ 
    where: { email },
    attributes: { exclude: ['password'] }
  });
  
  console.log('🔍 getUserByEmail result:', {
    id: user?.id,
    email: user?.email,
    role: user?.role,
    isApproved: user?.isApproved
  });
  
  return user;
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