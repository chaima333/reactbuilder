import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { MediaService } from './media.service';
import { Media } from '../../models';

// 1. Handling Upload
// src/modules/media/media.controller.ts

export const handleUpload = async (req: AuthRequest, res: Response) => {
  try {
    // 🔍 1. Debugging Logs: باش نثبتوا الحاجات قبل ما نبعثوهم للـ Service
    console.log("🚀 [MediaController] Start Upload Process");
    console.log("📂 File received:", req.file ? req.file.originalname : "NULL");
    console.log("🌍 Site Context:", req.siteContext);
    console.log("👤 User ID:", req.user?.id);

    if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
    }
    
    const siteId = req.siteContext?.siteId;
    if (!siteId) {
        console.error("❌ [MediaController] Missing Site ID in context");
        return res.status(400).json({ message: "Site context missing" });
    }

    // ⚙️ 2. Calling the Service
    const media = await MediaService.processUpload(
      req.file, 
      siteId.toString(),
      req.user.id, 
      req.body.alt
    );

    console.log("✅ [MediaController] Upload Success:", media.id);
    return res.status(201).json({ success: true, data: media });

  } catch (err: any) {
    // 🔥 3. CRITICAL: هذا أهم سطر باش يخرجلك الـ Error الحقيقي في الـ Terminal
    console.error("🔥 [MediaController] CRASH ERROR:", err);
    
    return res.status(500).json({ 
      success: false, 
      message: err.message,
      // نزيدو الـ stack في الـ Response باش Postman يقلنا وين بالضبط صار الـ crash
      stack: err.stack 
    });
  }
};

// 2. Handling Get All (اللي كان ناقص)
export const handleGetAll = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext?.siteId;
    
    const media = await Media.findAll({
      where: { siteId },
      order: [['createdAt', 'DESC']] // الأجدد ديما يظهر الأول
    });

    return res.json({ success: true, data: media });
  } catch (err: any) {
    return res.status(500).json({ message: "Error fetching media" });
  }
};

// 3. Handling Delete (اللي كان ناقص)
export const handleDelete = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await MediaService.removeMedia(id, req.user.id);
    
    return res.json({ success: true, message: "Media deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 4. Handling Update Alt (اللي كان ناقص)
export const handleUpdateAlt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { alt } = req.body;

    const media = await Media.findOne({ where: { id, userId: req.user.id } });
    if (!media) return res.status(404).json({ message: "Media not found" });

    await media.update({ alt });

    return res.json({ success: true, data: media });
  } catch (err: any) {
    return res.status(500).json({ message: "Error updating alt text" });
  }
};