"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.authenticateJWT = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const secretkey = process.env.JWT_SECRET;
const generateToken = (payload) => {
    const expiresIn = payload.type === "refresh" ? "7d" : "1h";
    return jsonwebtoken_1.default.sign(payload, secretkey, { expiresIn });
};
exports.generateToken = generateToken;
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Access Denied: Token is not provided.'
            });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        const verified = jsonwebtoken_1.default.verify(token, secretkey);
        const user = await models_1.User.findByPk(verified.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (!user.isApproved && user.role !== 'Admin') {
            res.status(403).json({
                success: false,
                message: 'Your account is pending admin approval.'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ success: false, message: 'Token expired' });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(403).json({ success: false, message: 'Invalid token' });
        }
        else {
            console.error('Auth error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};
exports.authenticateJWT = authenticateJWT;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, secretkey);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
