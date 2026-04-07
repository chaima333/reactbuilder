"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingUsers = exports.approveUser = exports.getUserByEmail = exports.addUser = void 0;
// user.service.ts
const models_1 = require("../models");
// Ajouter un utilisateur
const addUser = async (name, email, password, role, isApproved = false) => {
    return await models_1.User.create({
        name,
        email,
        password,
        role: role,
        isApproved
    });
};
exports.addUser = addUser;
const getUserByEmail = async (email) => {
    const user = await models_1.User.findOne({ where: { email } });
    console.log("🔍 getUserByEmail DETAIL:", {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        roleValue: user?.getDataValue('role'),
        toJSON: user?.toJSON()
    });
    return user;
};
exports.getUserByEmail = getUserByEmail;
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
