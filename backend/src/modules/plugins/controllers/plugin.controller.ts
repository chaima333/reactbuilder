import { Response } from 'express';
import { PluginService } from '../services/plugin.service';
import { AuthRequest } from '../../../shared/auth.util';
export const getSitePlugins = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;

    if (!siteId) {
      return res.status(400).json({ success: false, message: "siteId est requis" });
    }

    const slugs = await PluginService.getEnabledSlugs(Number(siteId));

    return res.json({
      success: true,
      data: slugs
    });
  } catch (error) {
    console.error('Error in getSitePlugins:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des plugins" 
    });
  }
};

