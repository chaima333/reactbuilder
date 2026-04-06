import { Response } from 'express';
import { User, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';
import bcrypt from 'bcrypt';

// Au lieu de (req: Request), utilise (req: AuthRequest)
export const myController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;  // Maintenant reconnu
  const { name } = req.body;  // Maintenant reconnu
}

// Récupérer tous les utilisateurs (admin seulement)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Version sans les associations Site pour l'instant
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Créer un utilisateur (admin)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Viewer'
    } as any);

    // Journaliser l'activité
    await ActivityLog.create({
      userId: req.user.id,
      action: 'user_created',
      entityType: 'user',
      entityId: user.id,
      details: { name: user.name, email: user.email, role: user.role }
    } as any);

    const userWithoutPassword = user.toJSON();
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
    const { name, email, role, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Journaliser l'activité
    await ActivityLog.create({
      userId: req.user.id,
      action: 'user_updated',
      entityType: 'user',
      entityId: user.id,
      details: { name: user.name, email: user.email, role: user.role }
    } as any);

    const userWithoutPassword = user.toJSON();
    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur
// Supprimer un utilisateur
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
    const currentUserId = req.user.id;

    console.log('=== DELETE USER ===');
    console.log('userId to delete:', userId);
    console.log('currentUserId:', currentUserId);

    if (userId === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vous ne pouvez pas supprimer votre propre compte' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // 1. Supprimer les tokens de l'utilisateur
    const Token = require('../models').Token;
    await Token.destroy({ where: { userId } });
    console.log('Tokens supprimés');

    // 2. Supprimer les pages de l'utilisateur
    const Page = require('../models').Page;
    await Page.destroy({ where: { userId } });
    console.log('Pages supprimées');

    // 3. Supprimer les médias de l'utilisateur
    const Media = require('../models').Media;
    await Media.destroy({ where: { userId } });
    console.log('Medias supprimés');

    // 4. Supprimer les logs d'activité
    await ActivityLog.destroy({ where: { userId } });
    console.log('ActivityLogs supprimés');

    // 5. Transférer les sites à l'admin ou les supprimer
    const Site = require('../models').Site;
    await Site.update({ ownerId: currentUserId }, { where: { ownerId: userId } });
    console.log('Sites transférés');

    // 6. Supprimer l'utilisateur
    await user.destroy();
    console.log('Utilisateur supprimé');

    // Journaliser l'activité
    await ActivityLog.create({
      userId: currentUserId,
      action: 'user_deleted',
      entityType: 'user',
      entityId: user.id,
      details: { name: user.name, email: user.email }
    } as any);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete user error DETAIL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Changer le rôle d'un utilisateur
export const changeUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
    const { role } = req.body;

    if (!['Admin', 'Editor', 'Viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const oldRole = user.role;
    await user.update({ role });

    await ActivityLog.create({
      userId: req.user.id,
      action: 'user_role_changed',
      entityType: 'user',
      entityId: user.id,
      details: { name: user.name, oldRole, newRole: role }
    } as any);

    res.json({
      success: true,
      message: 'Rôle mis à jour',
      data: { id: user.id, role: user.role }
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};