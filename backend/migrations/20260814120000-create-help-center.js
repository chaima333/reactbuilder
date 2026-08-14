"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("help_categories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false,
        unique: true,
      },
      name_fr: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      name_en: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      description_fr: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("help_articles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "help_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      slug: {
        type: Sequelize.STRING(160),
        allowNull: false,
        unique: true,
      },
      title_fr: {
        type: Sequelize.STRING(220),
        allowNull: false,
      },
      title_en: {
        type: Sequelize.STRING(220),
        allowNull: false,
      },
      summary_fr: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      summary_en: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      content_fr: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      content_en: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      keywords: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("help_categories", ["slug"], {
      unique: true,
      name: "help_categories_slug_unique",
    });
    await queryInterface.addIndex("help_categories", ["active", "display_order"], {
      name: "help_categories_active_order_idx",
    });
    await queryInterface.addIndex("help_articles", ["slug"], {
      unique: true,
      name: "help_articles_slug_unique",
    });
    await queryInterface.addIndex("help_articles", ["category_id"], {
      name: "help_articles_category_id_idx",
    });
    await queryInterface.addIndex("help_articles", ["published", "active"], {
      name: "help_articles_published_active_idx",
    });
    await queryInterface.addIndex("help_articles", ["category_id", "display_order"], {
      name: "help_articles_category_order_idx",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("help_articles");
    await queryInterface.dropTable("help_categories");
  },
};
