import { Token } from "../models/token";

// Ajouter un token
export const addToken = async (
  token: string,
  type: 'access' | 'refresh',
  userId: number
) => {
  const tokenInstance = new Token();
  tokenInstance.token = token;
  tokenInstance.type = type;
  tokenInstance.userId = userId;

  return tokenInstance.save();
};

// Supprimer tous les tokens d'un utilisateur
export const deleteToken = async (userId: number) => {
  return Token.destroy({
    where: {
      userId
    }
  });
};

// Récupérer un token par sa valeur
export const getToken = async (token: string) => {
  return Token.findOne({
    where: {
      token,
    },
  });
};

// 🔥 NOUVELLE FONCTION : Révoquer tous les refresh tokens d'un utilisateur
export const revokeUserTokens = async (userId: number) => {
  return Token.update(
    { isRevoked: true },
    { 
      where: { 
        userId, 
        type: 'refresh',
        isRevoked: false 
      } 
    }
  );
};

// 🔥 NOUVELLE FONCTION : Révoquer un token spécifique
export const revokeToken = async (token: string) => {
  return Token.update(
    { isRevoked: true },
    { where: { token } }
  );
};