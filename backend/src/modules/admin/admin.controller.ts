import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import * as AdminService from './admin.service';

export const getPendingUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await AdminService.fetchPendingUsers(req.user.id);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: 'ID invalide' });

    const user = await AdminService.approveUserById(userId, req.user.id);
    res.json({ success: true, message: 'Utilisateur approuvé', data: user });
  } catch (error: any) {
    const status = error.message === 'Utilisateur non trouvé' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const rejectUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: 'ID invalide' });

    await AdminService.deleteUserById(userId);
    res.json({ success: true, message: 'Utilisateur refusé et supprimé' });
  } catch (error: any) {
    const status = error.message === 'Utilisateur non trouvé' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};