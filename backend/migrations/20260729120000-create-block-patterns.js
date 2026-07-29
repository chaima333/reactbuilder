"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("block_patterns", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sites",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },

      slug: {
        type: Sequelize.STRING(160),
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      root_block: {
        type: Sequelize.JSONB,
        allowNull: false
      },

      block_type: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: "section"
      },

      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });

    await queryInterface.addIndex(
      "block_patterns",
      ["site_id", "slug"],
      {
        unique: true,
        name: "unique_block_pattern_site_slug"
      }
    );

    await queryInterface.addIndex(
      "block_patterns",
      ["site_id"],
      {
        name: "block_patterns_site_id_idx"
      }
    );

    await queryInterface.addIndex(
      "block_patterns",
      ["site_id", "created_at"],
      {
        name: "block_patterns_site_created_at_idx"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("block_patterns");
  }
};
