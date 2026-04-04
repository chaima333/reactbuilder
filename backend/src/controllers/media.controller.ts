import { Response } from 'express';
import { Media, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    console.log('📁 Destination upload:', uploadDir);
    console.log('📁 Le dossier existe?', fs.existsSync(uploadDir));
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Création du dossier uploads...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Nom du fichier généré:', filename);
    cb(null, filename);
  }
});

// File filter pour tous les types de fichiers
const fileFilter = (req: any, file: any, cb: any) => {
  console.log('🔍 Fichier reçu:', file.originalname, file.mimetype);
  
  const allowedTypes = {
    images: /jpeg|jpg|png|gif|webp|svg/,
    documents: /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/,
    videos: /mp4|webm|avi|mov|mkv/,
    audios: /mp3|wav|ogg|flac/,
    archives: /zip|rar|7z|tar|gz/
  };
  
  // Vérifier le type
  const ext = path.extname(file.originalname).toLowerCase();
  const isImage = allowedTypes.images.test(ext);
  const isDocument = allowedTypes.documents.test(ext);
  const isVideo = allowedTypes.videos.test(ext);
  const isAudio = allowedTypes.audios.test(ext);
  const isArchive = allowedTypes.archives.test(ext);
  
  if (isImage || isDocument || isVideo || isAudio || isArchive) {
    let type = 'other';
    if (isImage) type = 'image';
    else if (isVideo) type = 'video';
    else if (isAudio) type = 'audio';
    else if (isDocument) type = 'document';
    else if (isArchive) type = 'archive';
    
    (req as any).fileType = type;
    console.log('✅ Format accepté:', type);
    return cb(null, true);
  }
  
  console.log('❌ Format refusé');
  cb(new Error('Type de fichier non supporté'));
};

// Upload - limite à 50MB pour tous les fichiers
export const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter
});

// Upload de fichier
export const uploadImage = async (req: AuthRequest, res: Response) => {
  console.log('=== 📤 UPLOAD FICHIER ===');
  console.log('req.file:', (req as any).file);
  console.log('req.body:', req.body);
  console.log('req.user:', req.user);
  
  try {
    const file = (req as any).file;
    if (!file) {
      console.log('❌ Aucun fichier dans req.file');
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    // Déterminer le type
    const ext = path.extname(file.originalname).toLowerCase();
    let fileType = 'other';
    if (/jpeg|jpg|png|gif|webp|svg/.test(ext)) fileType = 'image';
    else if (/mp4|webm|avi|mov|mkv/.test(ext)) fileType = 'video';
    else if (/mp3|wav|ogg|flac/.test(ext)) fileType = 'audio';
    else if (/pdf|doc|docx|xls|xlsx|ppt|pptx|txt/.test(ext)) fileType = 'document';
    else if (/zip|rar|7z|tar|gz/.test(ext)) fileType = 'archive';

    console.log('✅ Fichier reçu:', file.originalname, file.size, 'bytes', 'Type:', fileType);

    const { siteId, alt, folderId } = req.body;
    const userId = req.user.id;

    const media = await Media.create({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      type: fileType,
      size: file.size,
      alt: alt || '',
      folderId: folderId ? parseInt(folderId) : null,
      userId,
      siteId: siteId ? parseInt(siteId) : null,
    } as any);

    console.log('✅ Media créé en DB:', media.id);

    // Journaliser l'activité
    await ActivityLog.create({
      userId,
      siteId: siteId ? parseInt(siteId) : null,
      action: 'media_uploaded',
      entityType: 'media',
      entityId: media.id,
      details: { filename: file.originalname, size: file.size, type: fileType }
    } as any);

    console.log('✅ Upload terminé avec succès');
    
    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: media
    });
  } catch (error) {
    console.error('❌ Upload error DETAIL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'upload',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Récupérer tous les médias
export const getMedia = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { siteId, folderId, type } = req.query;

    const where: any = { userId };
    if (siteId) where.siteId = siteId;
    if (folderId) where.folderId = folderId;
    if (type) where.type = type;

    const media = await Media.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer un média
export const deleteMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const media = await Media.findOne({ where: { id, userId } });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Média non trouvé' });
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.destroy();

    res.json({
      success: true,
      message: 'Média supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour la description/ALT
export const updateMediaAlt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { alt } = req.body;
    const userId = req.user.id;

    const media = await Media.findOne({ where: { id, userId } });
    if (!media) {
      return res.status(404).json({ success: false, message: 'Média non trouvé' });
    }

    await media.update({ alt });

    res.json({
      success: true,
      message: 'Description mise à jour',
      data: media
    });
  } catch (error) {
    console.error('Update alt error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};