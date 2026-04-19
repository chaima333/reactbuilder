import { Media, ActivityLog } from '../../models';
import path from 'path';
import fs from 'fs';

export class MediaService {
  static async upload({ file, userId, siteId, body }: any) {
    const { alt, folderId } = body || {};
    
    // 1. تحديد نوع الملف
    const ext = path.extname(file.originalname).toLowerCase();
    let fileType = 'other';
    if (/jpeg|jpg|png|gif|webp|svg/.test(ext)) fileType = 'image';
    else if (/mp4|webm|avi|mov|mkv/.test(ext)) fileType = 'video';
    else if (/mp3|wav|ogg|flac/.test(ext)) fileType = 'audio';
    else if (/pdf|doc|docx|xls|xlsx|ppt|pptx|txt/.test(ext)) fileType = 'document';

    // 2. التسجيل في قاعدة البيانات
    const media = await Media.create({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      type: fileType,
      size: file.size,
      alt: alt || '',
      userId,
      siteId, // 👈 توّة الـ ID باش يتسجّل صحيح (50)
      folderId: folderId ? parseInt(folderId.toString()) : null,
    } as any);

    // 3. سجل النشاط (Audit Log)
    await ActivityLog.create({
      userId,
      siteId,
      action: 'media_uploaded',
      entityType: 'media',
      entityId: media.id,
      details: { filename: file.originalname, type: fileType }
    } as any);

    return media;
  }

  static async deleteMediaAndFile(mediaId: string, userId: number) {
    const media = await Media.findOne({ where: { id: mediaId, userId } });
    if (!media) throw new Error('Média non trouvé');

    // الـ Path لازم يكون دقيق حسب الـ Folder structure في Render
    const filePath = path.join(process.cwd(), media.url); 
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.destroy();
    return true;
  }
}

export default MediaService;