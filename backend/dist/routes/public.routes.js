"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const router = (0, express_1.Router)();
// Route pour récupérer un site par son sous-domaine (ex: monsite)
router.get('/sites/:subdomain', async (req, res) => {
    try {
        const { subdomain } = req.params;
        console.log('Recherche par sous-domaine:', subdomain);
        const site = await models_1.Site.findOne({
            where: { subdomain, status: 'active' },
            include: [
                {
                    model: models_1.Page,
                    as: 'pages',
                    where: { status: 'published' },
                    required: false,
                }
            ]
        });
        if (!site) {
            return res.status(404).json({ error: 'Site non trouvé' });
        }
        res.json({
            id: site.id,
            name: site.name,
            title: site.title,
            description: site.description,
            pages: site.pages || []
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Route pour récupérer un site par son ID (ex: 1)
router.get('/sites/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Recherche par ID:', id);
        const site = await models_1.Site.findByPk(id, {
            include: [
                {
                    model: models_1.Page,
                    as: 'pages',
                    where: { status: 'published' },
                    required: false,
                }
            ]
        });
        if (!site) {
            return res.status(404).json({ error: 'Site non trouvé' });
        }
        res.json({
            id: site.id,
            name: site.name,
            title: site.title,
            description: site.description,
            pages: site.pages || []
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
exports.default = router;
