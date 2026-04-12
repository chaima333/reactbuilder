"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDB = void 0;
const connection_1 = require("./connection");
const initializeDB = async () => {
    try {
        await connection_1.sequelize.authenticate();
        console.log("✅ Connexion à PostgreSQL établie");
        await connection_1.sequelize.sync({ alter: true });
        console.log("✅ Modèles synchronisés");
    }
    catch (error) {
        console.error("❌ Erreur Sequelize:", error);
        process.exit(1);
    }
};
exports.initializeDB = initializeDB;
