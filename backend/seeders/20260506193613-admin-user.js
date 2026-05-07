'use strict';
const bcrypt = require('bcryptjs'); // تأكد إنك صابب bcryptjs

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // تشفير الباسورد (لازم يكون هو بيدو اللي تستعمل فيه في الـ Register)
    const hashedPassword = await bcrypt.hash('Chaima123')

    return queryInterface.bulkInsert('users', [{
      name: 'Admin User',
      email: 'kaboudichaima123@gmail.com',
      password: hashedPassword,
      role: 'Admin',
      avatar: 'https://via.placeholder.com/150',
      is_approved: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@test.com' }, {});
  }
};