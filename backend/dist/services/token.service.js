"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeToken = exports.revokeUserTokens = exports.getToken = exports.deleteToken = exports.addToken = void 0;
const token_1 = require("../models/token");
// Ajouter un token
const addToken = async (token, type, userId) => {
    const tokenInstance = new token_1.Token();
    tokenInstance.token = token;
    tokenInstance.type = type;
    tokenInstance.userId = userId;
    return tokenInstance.save();
};
exports.addToken = addToken;
// Supprimer tous les tokens d'un utilisateur
const deleteToken = async (userId) => {
    return token_1.Token.destroy({
        where: {
            userId
        }
    });
};
exports.deleteToken = deleteToken;
// Récupérer un token par sa valeur
const getToken = async (token) => {
    return token_1.Token.findOne({
        where: {
            token,
        },
    });
};
exports.getToken = getToken;
// 🔥 NOUVELLE FONCTION : Révoquer tous les refresh tokens d'un utilisateur
const revokeUserTokens = async (userId) => {
    return token_1.Token.update({ isRevoked: true }, {
        where: {
            userId,
            type: 'refresh',
            isRevoked: false
        }
    });
};
exports.revokeUserTokens = revokeUserTokens;
// 🔥 NOUVELLE FONCTION : Révoquer un token spécifique
const revokeToken = async (token) => {
    return token_1.Token.update({ isRevoked: true }, { where: { token } });
};
exports.revokeToken = revokeToken;
