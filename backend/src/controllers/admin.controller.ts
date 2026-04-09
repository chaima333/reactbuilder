import { Response } from 'express';
import { User, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';
import { Op } from 'sequelize/types/operators';

export const getPendingUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      where: {
        isApproved: false,
        id: { [Op.not]: req.user.id }
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await user.update({ isApproved: true });  // ← isApproved

    await ActivityLog.create({
      userId: req.user.id,
      action: 'user_approved',
      entityType: 'user',
      entityId: user.id,
      details: { name: user.name, email: user.email }
    } as any);

    res.json({ success: true, message: 'Utilisateur approuvé', data: user });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const rejectUser = async (req: AuthRequest, res: Response) => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];

    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await user.destroy();

    res.json({ success: true, message: 'Utilisateur refusé et supprimé' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};