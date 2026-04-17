
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util'; 
import { ROLE_PERMISSIONS } from '../constants/rolePermissions';

/**
 * Middleware pour vérifier les rôles autorisés
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 1. تثبّت إنّو الـ Context تعبّى م الـ Resolver
      if (!req.siteContext || !req.siteContext.siteId) {
        console.error("❌ Context Error: Site ID is missing!");
        return res.status(400).json({ 
          success: false, 
          message: "Site context missing in request" // ثبت في الميساج هذا
        });
      }

      const role = req.siteContext.role; 
      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        return res.status(403).json({ 
          success: false, 
          message: `Accès refusé: ${permission} manquant pour le rôle ${role}` 
        });
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