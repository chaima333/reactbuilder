"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectUser = exports.approveUser = exports.getPendingUsers = void 0;
const models_1 = require("../models");
const getPendingUsers = async (req, res) => {
    try {
        const users = await models_1.User.findAll({
            where: { isApproved: false }, // ← isApproved, pas is_approved
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: users });
    }
    catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.getPendingUsers = getPendingUsers;
const approveUser = async (req, res) => {
    try {
        let { id } = req.params;
        if (Array.isArray(id))
            id = id[0];
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        await user.update({ isApproved: true }); // ← isApproved
        await models_1.ActivityLog.create({
            userId: req.user.id,
            action: 'user_approved',
            entityType: 'user',
            entityId: user.id,
            details: { name: user.name, email: user.email }
        });
        res.json({ success: true, message: 'Utilisateur approuvé', data: user });
    }
    catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.approveUser = approveUser;
const rejectUser = async (req, res) => {
    try {
        let { id } = req.params;
        if (Array.isArray(id))
            id = id[0];
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: 'ID invalide' });
        }
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        await user.destroy();
        res.json({ success: true, message: 'Utilisateur refusé et supprimé' });
    }
    catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
exports.rejectUser = rejectUser;
