import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util'; 
import { SiteMember } from '../../models/SiteMember';


/**
 * Middleware pour vérifier les rôles autorisés
 */

export const PERMISSIONS = {
  SITE_READ: "site:read",
  SITE_EDIT: "site:edit",
  SITE_DELETE: "site:delete",
  SITE_INVITE: "site:invite",
};

const rolePermissions: Record<string, string[]> = {
  OWNER: [PERMISSIONS.SITE_READ, PERMISSIONS.SITE_EDIT, PERMISSIONS.SITE_DELETE, PERMISSIONS.SITE_INVITE],
  ADMIN: [PERMISSIONS.SITE_READ, PERMISSIONS.SITE_EDIT, PERMISSIONS.SITE_INVITE],
  EDITOR: [PERMISSIONS.SITE_READ, PERMISSIONS.SITE_EDIT],
  VIEWER: [PERMISSIONS.SITE_READ]
};

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const siteId = req.params.siteId;

      if (!siteId) {
        return res.status(400).json({ success: false, message: "Site ID missing in request" });
      }

      const membership = await SiteMember.findOne({
        where: { userId, siteId: Number(siteId) }
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: "Accès refusé. Vous n'êtes pas membre de ce site." });
      }

      const permissions = rolePermissions[membership.role.toUpperCase()] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({ success: false, message: `Permission manquante: ${permission}` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur d'autorisation" });
    }
  };
};
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const isAdminOrEditor = (req: AuthRequest, res: Response, next: NextFunction) => {
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