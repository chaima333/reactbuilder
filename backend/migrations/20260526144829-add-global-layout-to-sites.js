"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      "sites",
      "global_layout",
      {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      }
    );
  },

  async down(queryInterface) {

    await queryInterface.removeColumn(
      "sites",
      "global_layout"
    );
  }
};