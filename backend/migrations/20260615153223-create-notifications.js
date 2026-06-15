"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("notifications", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },

      site_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "sites", key: "id" },
        onDelete: "CASCADE",
      },

      type: { type: Sequelize.STRING(80), allowNull: false },
      title: { type: Sequelize.STRING(160), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: true },

      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("notifications");
  },
};