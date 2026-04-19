import { Router } from 'express';
import { Site, Page } from '../../models';

const router = Router();

// ✅ Route publique - Récupérer un site par sous-domaine
router.get('/sites/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    console.log('🔍 Route publique - Recherche par sous-domaine:', subdomain);
    
    const site = await Site.findOne({
      where: { subdomain, status: 'active' },
      include: [
        {
          model: Page,
          as: 'pages',
          where: { status: 'published' },
          required: false,
          attributes: ['id', 'title', 'slug', 'content', 'blocks', 'status', 'createdAt']
        }
      ]
    });

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site non trouvé' });
    }

    console.log('✅ Site trouvé:', site.name);
    
    res.json({ 
      success: true, 
      data: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        title: site.title,
        description: site.description,
        pages: site.pages || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur publique:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ✅ Route publique - Récupérer un site par ID (CORRIGÉE)
router.get('/sites/id/:siteId', async (req, res) => {
  try {
    const { siteId } = req.params;
    console.log('🔍 Route publique - Recherche par ID:', siteId);
    
    // CORRECTION: Utiliser findOne avec where au lieu de findByPk
    const site = await Site.findOne({
      where: { id: siteId, status: 'active' },
      include: [
        {
          model: Page,
          as: 'pages',
          where: { status: 'published' },
          required: false,
          attributes: ['id', 'title', 'slug', 'content', 'blocks', 'status', 'createdAt']
        }
      ]
    });
    
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site non trouvé' });
    }
    
    console.log('✅ Site trouvé par ID:', site.name);
    
    res.json({ 
      success: true, 
      data: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        title: site.title,
        description: site.description,
        pages: site.pages || []
      }
    });
  } catch (error) {
    console.error('❌ Erreur publique:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;