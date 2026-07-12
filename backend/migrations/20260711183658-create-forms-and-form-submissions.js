"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("forms", {
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

      page_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "pages",
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
        type: Sequelize.STRING(140),
        allowNull: false
      },

      schema: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },

      settings: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      "forms",
      ["site_id", "slug"],
      {
        unique: true,
        name: "unique_form_site_slug"
      }
    );

    await queryInterface.addIndex(
      "forms",
      ["site_id", "page_id"],
      {
        name: "forms_site_page_idx"
      }
    );

    await queryInterface.createTable("form_submissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "forms",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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

      page_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "pages",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },

      values: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },

      status: {
        type: Sequelize.ENUM(
          "new",
          "read",
          "archived",
          "spam"
        ),
        allowNull: false,
        defaultValue: "new"
      },

      ip_address: {
        type: Sequelize.STRING(64),
        allowNull: true
      },

      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
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
      "form_submissions",
      ["site_id", "form_id", "created_at"],
      {
        name: "form_submissions_site_form_created_idx"
      }
    );

    await queryInterface.addIndex(
      "form_submissions",
      ["status"],
      {
        name: "form_submissions_status_idx"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "form_submissions"
    );

    await queryInterface.dropTable(
      "forms"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_form_submissions_status";'
    );
  }
};