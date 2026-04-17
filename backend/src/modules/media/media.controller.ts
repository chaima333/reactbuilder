import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import MediaService from './media.service'; // 👈 ناديلو كـ Default export
import { Media } from '../../models';

export const uploadMedia = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext?.siteId;
    const userId = req.user?.id;

    if (!siteId || !userId) {
      return res.status(400).json({ success: false, message: "Missing tenant context" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 🎯 توّة الـ SiteId قاعد يتعدى للـ Service بالصحيح
    const media = await MediaService.upload({
      file: req.file,
      userId,
      siteId,
      body: req.body
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: media,
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllMedia = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext?.siteId;
    const { folderId, type } = req.query;

    const where: any = { siteId, userId: req.user.id };
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