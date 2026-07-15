"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("sites");

    if (!table.global_layout) {
      await queryInterface.addColumn(
        "sites",
        "global_layout",
        {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {}
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("sites");

    if (table.global_layout) {
      await queryInterface.removeColumn(
        "sites",
        "global_layout"
      );
    }
  }
};
