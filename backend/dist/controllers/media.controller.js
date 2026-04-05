"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaAlt = exports.deleteMedia = exports.getMedia = exports.uploadImage = exports.upload = void 0;
const models_1 = require("../models");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuration multer pour l'upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        console.log('📁 Destination upload:', uploadDir);
        console.log('📁 Le dossier existe?', fs_1.default.existsSync(uploadDir));
        if (!fs_1.default.existsSync(uploadDir)) {
            console.log('📁 Création du dossier uploads...');
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path_1.default.extname(file.originalname);
        console.log('📄 Nom du fichier généré:', filename);
        cb(null, filename);
    }
});
// File filter pour tous les types de fichiers
const fileFilter = (req, file, cb) => {
    console.log('🔍 Fichier reçu:', file.originalname, file.mimetype);
    const allowedTypes = {
        images: /jpeg|jpg|png|gif|webp|svg/,
        documents: /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/,
        videos: /mp4|webm|avi|mov|mkv/,
        audios: /mp3|wav|ogg|flac/,
        archives: /zip|rar|7z|tar|gz/
    };
    // Vérifier le type
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const isImage = allowedTypes.images.test(ext);
    const isDocument = allowedTypes.documents.test(ext);
    const isVideo = allowedTypes.videos.test(ext);
    const isAudio = allowedTypes.audios.test(ext);
    const isArchive = allowedTypes.archives.test(ext);
    if (isImage || isDocument || isVideo || isAudio || isArchive) {
        let type = 'other';
        if (isImage)
            type = 'image';
        else if (isVideo)
            type = 'video';
        else if (isAudio)
            type = 'audio';
        else if (isDocument)
            type = 'document';
        else if (isArchive)
            type = 'archive';
        req.fileType = type;
        console.log('✅ Format accepté:', type);
        return cb(null, true);
    }
    console.log('❌ Format refusé');
    cb(new Error('Type de fichier non supporté'));
};
// Upload - limite à 50MB pour tous les fichiers
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter
});
// Upload de fichier
const uploadImage = async (req, res) => {
    console.log('=== 📤 UPLOAD FICHIER ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);
    try {
        const file = req.file;
        if (!file) {
            console.log('❌ Aucun fichier dans req.file');
            return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
        }
        // Déterminer le type
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        let fileType = 'other';
        if (/jpeg|jpg|png|gif|webp|svg/.test(ext))
            fileType = 'image';
        else if (/mp4|webm|avi|mov|mkv/.test(ext))
            fileType = 'video';
        else if (/mp3|wav|ogg|flac/.test(ext))
            fileType = 'audio';
        else if (/pdf|doc|docx|xls|xlsx|ppt|pptx|txt/.test(ext))
            fileType = 'document';
        else if (/zip|rar|7z|tar|gz/.test(ext))
            fileType = 'archive';
        console.log('✅ Fichier reçu:', file.originalname, file.size, 'bytes', 'Type:', fileType);
        const { siteId, alt, folderId } = req.body;
        const userId = req.user.id;
        const media = await models_1.Media.create({
            filename: file.originalname,
            url: `/uploads/${file.filename}`,
            type: fileType,
            size: file.size,
            alt: alt || '',
            folderId: folderId ? parseInt(folderId) : null,
            userId,
            siteId: siteId ? parseInt(siteId) : null,
        });
        console.log('✅ Media créé en DB:', media.id);
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId,
            siteId: siteId ? parseInt(siteId) : null,
            action: 'media_uploaded',
            entityType: 'media',
            entityId: media.id,
            details: { filename: file.originalname, size: file.size, type: fileType }
        });
        console.log('✅ Upload terminé avec succès');
        res.json({
            success: true,
            message: 'Fichier uploadé avec succès',
            data: media
        });
    }
    catch (error) {
        console.error('❌ Upload error DETAIL:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.uploadImage = uploadImage;
// Récupérer tous les médias
const getMedia = async (req, res) => {
    try {
        const userId = req.user.id;
        const { siteId, folderId, type } = req.query;
        const where = { userId };
        if (siteId)
            where.siteId = siteId;
        if (folderId)
            where.folderId = folderId;
        if (type)
            where.type = type;
        const media = await models_1.Media.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.json({
            success: true,
            data: media
        });
    }
    catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getMedia = getMedia;
// Supprimer un média
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const media = await models_1.Media.findOne({ where: { id, userId } });
        if (!media) {
            return res.status(404).json({ success: false, message: 'Média non trouvé' });
        }
        // Supprimer le fichier physique
        const filePath = path_1.default.join(__dirname, '../../', media.url);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await media.destroy();
        res.json({
            success: true,
            message: 'Média supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.deleteMedia = deleteMedia;
// Mettre à jour la description/ALT
const updateMediaAlt = async (req, res) => {
    try {
        const { id } = req.params;
        const { alt } = req.body;
        const userId = req.user.id;
        const media = await models_1.Media.findOne({ where: { id, userId } });
        if (!media) {
            return res.status(404).json({ success: false, message: 'Média non trouvé' });
        }
        await media.update({ alt });
        res.json({
            success: true,
            message: 'Description mise à jour',
            data: media
        });
    }
    catch (error) {
        console.error('Update alt error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.updateMediaAlt = updateMediaAlt;
