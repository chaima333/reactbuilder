import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/auth.util'; // Import du type

/**
 * Middleware pour vérifier les rôles autorisés
 */
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