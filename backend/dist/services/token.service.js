"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = exports.deleteToken = exports.addToken = void 0;
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
const deleteToken = async (userId) => {
    return token_1.Token.destroy({
        where: {
            userId
        }
    });
};
exports.deleteToken = deleteToken;
const getToken = async (token) => {
    return token_1.Token.findOne({
        where: {
            token,
        },
    });
};
exports.getToken = getToken;
