"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ai_generations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      siteId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      prompt: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false
      },

      pagesGenerated: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "success"
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ai_generations");
  }
};