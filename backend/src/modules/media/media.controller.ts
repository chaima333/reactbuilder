import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import { MediaService } from './media.service';
import { Media } from '../../models';

export const handleUpload = async (req: AuthRequest, res: Response) => {
  try {
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

    const media = await MediaService.processUpload(
      req.file, 
      siteId.toString(),
      req.user.id, 
      req.body.alt
    );

    console.log("✅ [MediaController] Upload Success:", media.id);
    return res.status(201).json({ success: true, data: media });

  } catch (err: any) {
    console.error("🔥 [MediaController] CRASH ERROR:", err);
    
    return res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: err.stack 
    });
  }
};

export const handleGetAll = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      req.siteContext?.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Site context missing"
      });
    }

    const media =
      await Media.findAll({
        where: {
          siteId
        },
        order: [
          ["createdAt", "DESC"]
        ]
      });

    return res.json({
      success: true,
      data: media
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching media"
    });
  }
};

export const handleDelete = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } =
      req.params;

    const siteId =
      req.siteContext?.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Site context missing"
      });
    }

    await MediaService.removeMedia(
      id,
      String(siteId)
    );

    return res.json({
      success: true,
      message: "Media deleted successfully"
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const handleUpdateAlt = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } =
      req.params;

    const { alt } =
      req.body;

    const siteId =
      req.siteContext?.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Site context missing"
      });
    }

    const media =
      await Media.findOne({
        where: {
          id,
          siteId
        }
      });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found"
      });
    }

    await media.update({
      alt
    });

    return res.json({
      success: true,
      data: media
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Error updating alt text"
    });
  }

};