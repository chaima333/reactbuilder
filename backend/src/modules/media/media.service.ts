import { Media, ActivityLog } from '../../models';
import path from 'path';
import fs from 'fs';

export const createMediaRecord = async (file: any, userId: number, body: any) => {
  const { siteId, alt, folderId } = body;
  
  // تحديد النوع بناءً على الامتداد
  const ext = path.extname(file.originalname).toLowerCase();
  let fileType = 'other';
  if (/jpeg|jpg|png|gif|webp|svg/.test(ext)) fileType = 'image';
  else if (/mp4|webm|avi|mov|mkv/.test(ext)) fileType = 'video';
  else if (/mp3|wav|ogg|flac/.test(ext)) fileType = 'audio';
  else if (/pdf|doc|docx|xls|xlsx|ppt|pptx|txt/.test(ext)) fileType = 'document';
  else if (/zip|rar|7z|tar|gz/.test(ext)) fileType = 'archive';

  const media = await Media.create({
    filename: file.originalname,
    url: `/uploads/${file.filename}`,
    type: fileType,
    size: file.size,
    alt: alt || '',
    folderId: folderId ? parseInt(folderId) : null,
    userId,
    siteId: body.siteId ? parseInt(body.siteId.toString()) : null,
  } as any);

  // سجل النشاط
  await ActivityLog.create({
    userId,
    siteId: body.siteId ? parseInt(body.siteId.toString()) : null,
    action: 'media_uploaded',
    entityType: 'media',
    entityId: media.id,
    details: { filename: file.originalname, size: file.size, type: fileType }
  } as any);

  return media;
};

export const deleteMediaAndFile = async (mediaId: string, userId: number) => {
  const media = await Media.findOne({ where: { id: mediaId, userId } });
  if (!media) throw new Error('Média non trouvé');

  const filePath = path.join(__dirname, '../../', media.url);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await media.destroy();
  return true;
};