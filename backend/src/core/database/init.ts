import { sequelize } from "./connection";

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // نردوها true لمرة واحدة باش نصلحو الجداول الناقصة
    // بعد ما يتصلح الـ Deploy، تنجم ترجعها false
    await sequelize.sync({ alter: true }); 
    console.log("📦 DB Synced (Columns updated successfully)");

  } catch (error) {
    console.error("❌ DB error:", error);
    process.exit(1);
  }
};