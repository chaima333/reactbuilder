"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserRole = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = exports.myController = void 0;
const models_1 = require("../models");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Au lieu de (req: Request), utilise (req: AuthRequest)
const myController = async (req, res) => {
    const { id } = req.params; // ✅ Maintenant reconnu
    const { name } = req.body; // ✅ Maintenant reconnu
    const { page } = req.query; // ✅ Maintenant reconnu
    const authHeader = req.headers.authorization;
};
exports.myController = myController;
// Récupérer tous les utilisateurs (admin seulement)
const getUsers = async (req, res) => {
    try {
        // Version sans les associations Site pour l'instant
        const users = await models_1.User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getUsers = getUsers;
// Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
        const user = await models_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getUserById = getUserById;
// Créer un utilisateur (admin)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Vérifier si l'email existe déjà
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await models_1.User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Viewer'
        });
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId: req.user.id,
            action: 'user_created',
            entityType: 'user',
            entityId: user.id,
            details: { name: user.name, email: user.email, role: user.role }
        });
        const userWithoutPassword = user.toJSON();
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.createUser = createUser;
// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
        const { name, email, role, password } = req.body;
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        const updateData = { name, email, role };
        if (password) {
            updateData.password = await bcrypt_1.default.hash(password, 10);
        }
        await user.update(updateData);
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId: req.user.id,
            action: 'user_updated',
            entityType: 'user',
            entityId: user.id,
            details: { name: user.name, email: user.email, role: user.role }
        });
        const userWithoutPassword = user.toJSON();
        res.json({
            success: true,
            message: 'Utilisateur mis à jour',
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.updateUser = updateUser;
// Supprimer un utilisateur
// Supprimer un utilisateur
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
        const currentUserId = req.user.id;
        console.log('=== DELETE USER ===');
        console.log('userId to delete:', userId);
        console.log('currentUserId:', currentUserId);
        if (userId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        // 1. Supprimer les tokens de l'utilisateur
        const Token = require('../models').Token;
        await Token.destroy({ where: { userId } });
        console.log('Tokens supprimés');
        // 2. Supprimer les pages de l'utilisateur
        const Page = require('../models').Page;
        await Page.destroy({ where: { userId } });
        console.log('Pages supprimées');
        // 3. Supprimer les médias de l'utilisateur
        const Media = require('../models').Media;
        await Media.destroy({ where: { userId } });
        console.log('Medias supprimés');
        // 4. Supprimer les logs d'activité
        await models_1.ActivityLog.destroy({ where: { userId } });
        console.log('ActivityLogs supprimés');
        // 5. Transférer les sites à l'admin ou les supprimer
        const Site = require('../models').Site;
        await Site.update({ ownerId: currentUserId }, { where: { ownerId: userId } });
        console.log('Sites transférés');
        // 6. Supprimer l'utilisateur
        await user.destroy();
        console.log('Utilisateur supprimé');
        // Journaliser l'activité
        await models_1.ActivityLog.create({
            userId: currentUserId,
            action: 'user_deleted',
            entityType: 'user',
            entityId: user.id,
            details: { name: user.name, email: user.email }
        });
        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    }
    catch (error) {
        console.error('Delete user error DETAIL:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.deleteUser = deleteUser;
// Changer le rôle d'un utilisateur
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
        const { role } = req.body;
        if (!['Admin', 'Editor', 'Viewer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Rôle invalide' });
        }
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        const oldRole = user.role;
        await user.update({ role });
        await models_1.ActivityLog.create({
            userId: req.user.id,
            action: 'user_role_changed',
            entityType: 'user',
            entityId: user.id,
            details: { name: user.name, oldRole, newRole: role }
        });
        res.json({
            success: true,
            message: 'Rôle mis à jour',
            data: { id: user.id, role: user.role }
        });
    }
    catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.changeUserRole = changeUserRole;
