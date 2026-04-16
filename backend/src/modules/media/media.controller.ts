import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import * as MediaService from './media.service';
import { Media } from '../../models';

export const uploadMedia = async (req: AuthRequest, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });

    const media = await MediaService.createMediaRecord(file, req.user.id, req.body);
    
    res.json({ success: true, message: 'Fichier uploadé avec succès', data: media });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, folderId, type } = req.query;
    const where: any = { userId: req.user.id };
    if (siteId) where.siteId = siteId;
    if (folderId) where.folderId = folderId;
    if (type) where.type = type;

    const media = await Media.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteMedia = async (req: AuthRequest, res: Response) => {
  try {
    await MediaService.deleteMediaAndFile(req.params.id, req.user.id);
    res.json({ success: true, message: 'Média supprimé avec succès' });
  } catch (error: any) {
    res.status(error.message === 'Média non trouvé' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const updateMediaAlt = async (req: AuthRequest, res: Response) => {
  try {
    const media = await Media.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!media) return res.status(404).json({ success: false, message: 'Média non trouvé' });

    await media.update({ alt: req.body.alt });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};