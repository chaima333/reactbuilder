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
      const siteContext = req.siteContext;

      if (!siteContext?.siteId) {
        return res.status(400).json({ 
          success: false, 
          message: "Site context missing" 
        });
      }

      const role = siteContext.role;

      if (!role) {
        return res.status(403).json({ 
          success: false, 
          message: "No role assigned for this site" 
        });
      }

      const permissions = rolePermissions[role] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Permission manquante: ${permission}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Erreur d'autorisation" 
      });
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