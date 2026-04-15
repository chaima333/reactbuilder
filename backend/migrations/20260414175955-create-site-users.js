'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('site_users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sites', key: 'id' },
        onDelete: 'CASCADE'
      },

      role: {
        type: Sequelize.ENUM('Owner', 'Admin', 'Editor', 'Viewer'),
        allowNull: false,
        defaultValue: 'Viewer'
      },

      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });

    // منع التكرار (critical)
    await queryInterface.addConstraint('site_users', {
      fields: ['user_id', 'site_id'],
      type: 'unique',
      name: 'unique_user_site'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('site_users');
  }
};