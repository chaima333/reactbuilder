import { uploadStream, deleteFromCloudinary } from '../../core/config/cloudinary';
import { Media, ActivityLog } from '../../models';

export class MediaService {
  static async processUpload(file: Express.Multer.File, siteId: string, userId: string, alt?: string) {
    // 1. Storage Pipeline
    const cloudResult = await uploadStream(file.buffer, `sites/${siteId}/media`);

    // 2. Metadata Persistence
    const media = await Media.create({
      originalName: file.originalname,
      filename: cloudResult.public_id,
      url: cloudResult.secure_url,
      type: file.mimetype.startsWith('image') ? 'image' : 'file',
      size: file.size,
      alt: alt || '',
      userId,
      siteId,
    });

    // 3. Audit Trail
    await ActivityLog.create({
      userId, siteId,
      action: 'media_uploaded',
      entityType: 'media',
      entityId: media.id,
    });

    return media;
  }

  static async removeMedia(id: string, userId: string) {
    const media = await Media.findOne({ where: { id, userId } });
    if (!media) throw new Error("Media asset not found or unauthorized");

    await deleteFromCloudinary(media.filename);
    await media.destroy();
  }
}