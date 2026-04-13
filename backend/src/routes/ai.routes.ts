import { Router } from 'express';
import { authenticateJWT } from '../shared/auth.util';
import { aiService } from '../services/ai.service';

const router = Router();

// Sécurité : Seuls les utilisateurs connectés peuvent appeler l'IA
router.post('/generate-page', authenticateJWT, async (req, res) => {
  try {
    const { topic, pageType } = req.body;
    
    if (!topic || !pageType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le sujet (topic) et le type de page sont obligatoires' 
      });
    }

    const content = await aiService.generatePage(topic, pageType);
    
    res.json({ 
      success: true, 
      data: content 
    });
  } catch (error: any) {
    console.error('Erreur Route IA:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la génération' 
    });
  }
});

export default router;