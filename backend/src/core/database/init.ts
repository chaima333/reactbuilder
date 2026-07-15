import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    console.log("DB schema managed by migrations");

  } catch (error) {
    console.error("❌ DB error:", error);
    process.exit(1);
  }
};
