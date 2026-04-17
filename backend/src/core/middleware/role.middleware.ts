
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../shared/auth.util'; 
import { ROLE_PERMISSIONS } from '../constants/rolePermissions';

/**
 * Middleware pour vérifier les rôles autorisés
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const siteContext = req.siteContext;

      // تثبّت إنّو الـ TenantResolver خدم خدمتو
      if (!siteContext?.siteId) {
        return res.status(400).json({ 
          success: false, 
          message: "Site context missing in request" 
        });
      }

      const role = siteContext.role; // هوني الـ Role (OWNER, ADMIN, إلخ)

      if (!role) {
        return res.status(403).json({ 
          success: false, 
          message: "No role assigned for this site" 
        });
      }

      // 2️⃣ استعمل الـ Record الجديد اللي فيه PAGE_CREATE
      const permissions = ROLE_PERMISSIONS[role] || [];

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