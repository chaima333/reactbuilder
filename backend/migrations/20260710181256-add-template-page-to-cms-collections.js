"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "cms_collections",
      "template_page_id",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "pages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      }
    );

    await queryInterface.addIndex(
      "cms_collections",
      ["template_page_id"],
      {
        name: "cms_collections_template_page_id_idx"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "cms_collections",
      "cms_collections_template_page_id_idx"
    );

    await queryInterface.removeColumn(
      "cms_collections",
      "template_page_id"
    );
  }
};