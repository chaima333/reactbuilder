
import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à PostgreSQL établie");

    await sequelize.sync({ alter: true });
    console.log("✅ Modèles synchronisés");
  } catch (error) {
    console.error("❌ Erreur Sequelize:", error);
    process.exit(1);
  }
};