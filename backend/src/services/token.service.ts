import { where } from "sequelize";
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
export const deleteToken = async (userId: number)=>{
    return Token.destroy({
        where:{
            userId
        }
    })
}

export const getToken = async (token: string) => {
  return Token.findOne({
    where: {
      token,
    },
  });
};
