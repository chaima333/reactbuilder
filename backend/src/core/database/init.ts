import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync({ alter: false }); // production safe
    console.log("✅ Models synced");
  } catch (error) {
    console.error("❌ DB error:", error);
    process.exit(1);
  }
};