"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "pages",
      "visibility",
      {
        type: Sequelize.ENUM(
          "public",
          "members_only"
        ),
        allowNull: false,
        defaultValue: "public"
      }
    );

    await queryInterface.addIndex(
      "pages",
      [
        "site_id",
        "visibility",
        "status"
      ],
      {
        name:
          "pages_site_visibility_status_idx"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "pages",
      "pages_site_visibility_status_idx"
    );

    await queryInterface.removeColumn(
      "pages",
      "visibility"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_pages_visibility";'
    );
  }
};
