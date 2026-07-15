"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("page_versions");

    if (!table.status) {
      await queryInterface.addColumn("page_versions", "status", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("page_versions");

    if (table.status) {
      await queryInterface.removeColumn("page_versions", "status");
    }
  },
};
