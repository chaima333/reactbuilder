"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingUsers = exports.approveUser = exports.addUser = exports.getUserByEmail = void 0;
// user.service.ts
const models_1 = require("../models");
// Récupérer utilisateur par email
const getUserByEmail = async (email) => {
    return models_1.User.findOne({ where: { email } });
};
exports.getUserByEmail = getUserByEmail;
// Ajouter un utilisateur
const addUser = async (name, email, password, role = "Viewer", // valeur par défaut
isApproved = false) => {
    const user = new models_1.User();
    user.name = name;
    user.email = email;
    user.password = password; // déjà hashé avec bcrypt
    user.role = role;
    user.isApproved = isApproved;
    return await user.save(); // Sequelize crée id, createdAt, updatedAt automatiquement
};
exports.addUser = addUser;
// Approuver un utilisateur
const approveUser = async (userId) => {
    const user = await models_1.User.findByPk(userId);
    if (!user)
        throw new Error('User not found');
    await user.update({ isApproved: true });
    return user;
};
exports.approveUser = approveUser;
// Récupérer tous les utilisateurs en attente d'approbation
const getPendingUsers = async () => {
    return await models_1.User.findAll({
        where: { isApproved: false },
        attributes: { exclude: ['password'] },
    });
};
exports.getPendingUsers = getPendingUsers;
