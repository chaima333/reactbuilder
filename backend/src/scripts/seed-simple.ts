import { sequelize } from '../models';
import { User } from '../models/User';
import { Site } from '../models/site';
import { Page } from '../models/page';
import { ActivityLog } from '../models/activityLog';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    console.log('🚀 Démarrage du seed...');
    
    // Synchroniser les modèles
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // Trouver ou créer l'utilisateur
    let user = await User.findOne({ where: { email: 'mouna@test.com' } });

    if (!user) {
      user = await User.create({
        name: 'Mouna',
        email: 'mouna@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'Admin' as const
      });
      console.log(`✅ Utilisateur créé: ${user.name} (ID: ${user.id})`);
    } else {
      console.log(`👤 Utilisateur existant: ${user.name} (ID: ${user.id})`);
    }

    // Vérifier si des sites existent déjà
    const existingSites = await Site.count({ where: { ownerId: user.id } });
    
    if (existingSites > 0) {
      console.log(`⚠️ ${existingSites} sites existent déjà. Suppression...`);
      await ActivityLog.destroy({ where: { userId: user.id } });
      await Page.destroy({ where: { userId: user.id } });
      await Site.destroy({ where: { ownerId: user.id } });
      console.log('🗑️ Anciennes données supprimées');
    }

    // Créer un site
    const site = await Site.create({
      name: 'Mon Premier Site',
      subdomain: 'monsite',
      title: 'Bienvenue sur mon site',
      description: 'Un site créé avec ReactBuilder',
      ownerId: user.id,
      status: 'active' as const,
      language: 'fr',
      timezone: 'Europe/Paris',
      views: 0
    });

    console.log(`✅ Site créé: ${site.name} (ID: ${site.id})`);

    // Créer des pages
    const pagesData = [
      {
        title: 'Accueil',
        slug: 'accueil',
        content: '<h1>Bienvenue sur mon site</h1><p>Ceci est ma page d\'accueil.</p>',
        blocks: JSON.stringify([
          { type: 'hero', title: 'Bienvenue !', subtitle: 'Découvrez mon univers' },
          { type: 'text', content: 'Contenu de la page d\'accueil.' }
        ]),
        status: 'published' as const,
        views: 150,
        userId: user.id,
        siteId: site.id
      },
      {
        title: 'À propos',
        slug: 'a-propos',
        content: '<h1>À propos de moi</h1><p>Je suis développeuse web passionnée.</p>',
        blocks: JSON.stringify([
          { type: 'title', content: 'À propos' },
          { type: 'text', content: 'Présentation personnelle.' },
          { type: 'image', src: 'https://via.placeholder.com/300', alt: 'Photo de profil' }
        ]),
        status: 'published' as const,
        views: 75,
        userId: user.id,
        siteId: site.id
      },
      {
        title: 'Contact',
        slug: 'contact',
        content: '<h1>Contactez-moi</h1><p>Formulaire de contact.</p>',
        blocks: JSON.stringify([
          { type: 'title', content: 'Contact' },
          { type: 'form', fields: ['nom', 'email', 'message'] }
        ]),
        status: 'draft' as const,
        views: 0,
        userId: user.id,
        siteId: site.id
      }
    ];

    const pages = [];
    for (const pageData of pagesData) {
      const page = await Page.create(pageData);
      pages.push(page);
      console.log(`  📄 Page créée: ${page.title} (${page.status})`);
    }

    console.log(`✅ ${pages.length} pages créées`);

    // Créer des logs d'activité
    await ActivityLog.bulkCreate([
      {
        userId: user.id,
        siteId: site.id,
        action: 'site_created',
        entityType: 'site' as const,
        entityId: site.id,
        details: { name: site.name, timestamp: new Date().toISOString() },
        ip: '127.0.0.1',
        userAgent: 'Seed Script'
      },
      {
        userId: user.id,
        siteId: site.id,
        action: 'page_published',
        entityType: 'page' as const,
        entityId: pages[0].id,
        details: { title: pages[0].title, site: site.name },
        ip: '127.0.0.1',
        userAgent: 'Seed Script'
      },
      {
        userId: user.id,
        siteId: site.id,
        action: 'page_created',
        entityType: 'page' as const,
        entityId: pages[1].id,
        details: { title: pages[1].title },
        ip: '127.0.0.1',
        userAgent: 'Seed Script'
      }
    ]);

    console.log('✅ Activités créées');

    // Afficher les statistiques
    const totalSites = await Site.count({ where: { ownerId: user.id } });
    const totalPages = await Page.count({ where: { userId: user.id } });
    const totalViews = await Page.sum('views', { where: { userId: user.id } });
    const publishedPages = await Page.count({ where: { userId: user.id, status: 'published' } });
    const draftPages = await Page.count({ where: { userId: user.id, status: 'draft' } });

    console.log('\n📊 Statistiques finales:');
    console.log(`- Sites: ${totalSites}`);
    console.log(`- Pages: ${totalPages}`);
    console.log(`- Pages publiées: ${publishedPages}`);
    console.log(`- Pages brouillons: ${draftPages}`);
    console.log(`- Vues totales: ${totalViews || 0}`);
    console.log(`- Vues moyennes: ${Math.round((totalViews || 0) / (totalPages || 1))}`);

    // Afficher les détails des pages
    console.log('\n📄 Détail des pages:');
    const allPages = await Page.findAll({ 
      where: { userId: user.id },
      include: [{ model: Site, as: 'site', attributes: ['name'] }]
    });
    
    allPages.forEach(page => {
      const siteName = (page as any).site?.name || 'N/A';
      console.log(`  - ${page.title} (${page.status}) - ${page.views} vues - Site: ${siteName}`);
    });

    console.log('\n✅ Seed terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur seed:', error);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion DB fermée');
    process.exit(0);
  }
};

// Exécuter le seed
seedDatabase();