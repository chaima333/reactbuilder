import { Router } from 'express';
import { authenticateJWT } from '../../shared/auth.util';
import * as AiService from './ai.service'; // 👈 التغيير هنا: ناديو الملف اللي بجنبو

const router = Router();

router.post('/generate-page', authenticateJWT, async (req, res) => {
  try {
    const { topic, pageType } = req.body;
    
    if (!topic || !pageType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le sujet (topic) et le type de page sont obligatoires' 
      });
    }

    // ناديو الـ function من الـ Service
    const content = await AiService.generatePage(topic, pageType);
    
    res.json({ success: true, data: content });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;