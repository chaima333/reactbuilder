'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      url: { type: Sequelize.STRING, allowNull: false },
      // ... أي Columns أخرى تستحقها (لكن ما تحطش original_name هنا توة)
createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media');
  }
};