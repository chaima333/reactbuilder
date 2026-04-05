"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrEditor = exports.isAdmin = exports.authorizeRoles = void 0;
/**
 * Middleware pour vérifier les rôles autorisés
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Non authentifié"
            });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle requis: ${allowedRoles.join(' ou ')}`
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Non authentifié"
        });
    }
    if (user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: "Accès refusé. Droits administrateur requis"
        });
    }
    next();
};
exports.isAdmin = isAdmin;
const isAdminOrEditor = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Non authentifié"
        });
    }
    if (user.role !== 'Admin' && user.role !== 'Editor') {
        return res.status(403).json({
            success: false,
            message: "Accès refusé. Droits éditeur requis"
        });
    }
    next();
};
exports.isAdminOrEditor = isAdminOrEditor;
