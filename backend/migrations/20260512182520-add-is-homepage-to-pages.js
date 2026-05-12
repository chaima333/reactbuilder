'use strict';

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(

      "pages",

      "is_homepage",

      {

        type: Sequelize.BOOLEAN,

        allowNull: false,

        defaultValue: false
      }
    );
  },

  async down(queryInterface) {

    await queryInterface.removeColumn(

      "pages",

      "is_homepage"
    );
  }
};