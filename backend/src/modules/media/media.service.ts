import { uploadStream, deleteFromCloudinary } from '../../core/config/cloudinary';
import { Media, ActivityLog } from '../../models';

export class MediaService {
static async processUpload(file: any, siteId: string, userId: string, alt?: string) {
  // 1. Detect type (avant DB)
  const mime = file.mimetype;

  let fileType: 'image' | 'video' | 'file' = 'file';

  if (mime.startsWith('image/')) {
    fileType = 'image';
  } else if (mime.startsWith('video/')) {
    fileType = 'video';
  } else {
    const ext = file.originalname.toLowerCase();
    if (ext.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
      fileType = 'image';
    }
  }

  // 2. Upload to Cloudinary
  const cloudResult = await uploadStream(file.buffer, `sites/${siteId}/media`);

  // 3. Save in DB
  const media = await Media.create({
    originalName:
  Buffer.from(
    file.originalname,
    'latin1'
  ).toString('utf8'),
  
    filename: cloudResult.public_id,
    url: cloudResult.secure_url,
    type: fileType, // ✅ هنا
    size: file.size,
    alt: alt || '',
    userId,
    siteId,
  });

  // 4. Activity log
  await ActivityLog.create({
    userId,
    siteId,
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