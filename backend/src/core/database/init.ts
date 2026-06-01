import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync({ alter: true }); 
    console.log("📦 DB Synced (Columns updated successfully)");

  } catch (error) {
    console.error("❌ DB error:", error);
    process.exit(1);
  }
};