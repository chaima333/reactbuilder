import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // ❌ NO sync HERE
    console.log("📦 Using migrations only");
  } catch (error) {
    console.error("❌ DB error:", error);
    process.exit(1);
  }
};