'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      subdomain: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },

      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sites');
  }
};