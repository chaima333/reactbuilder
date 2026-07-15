'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pages");

    if (!table.is_homepage) {
      await queryInterface.addColumn(

        "pages",

        "is_homepage",

        {

          type: Sequelize.BOOLEAN,

          allowNull: false,

          defaultValue: false
        }
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("pages");

    if (table.is_homepage) {
      await queryInterface.removeColumn(

        "pages",

        "is_homepage"
      );
    }
  }
};
