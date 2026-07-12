
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1.  cms_collections
    await queryInterface.createTable("cms_collections", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sites",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 2. Unique index pour (site_id, slug)
    await queryInterface.addIndex("cms_collections", ["site_id", "slug"], {
      unique: true,
      name: "unique_cms_collection_site_slug",
    });

    // 3. cms_fields
    await queryInterface.createTable("cms_fields", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      collection_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "cms_collections",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          "text",
          "textarea",
          "number",
          "boolean",
          "image",
          "date",
          "select"
        ),
        allowNull: false,
        defaultValue: "text",
      },
      required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 4. Unique index pour (collection_id, key)
    await queryInterface.addIndex("cms_fields", ["collection_id", "key"], {
      unique: true,
      name: "unique_cms_field_collection_key",
    });

    // 5.  cms_entries
    await queryInterface.createTable("cms_entries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sites",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      collection_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "cms_collections",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("draft", "published"),
        allowNull: false,
        defaultValue: "draft",
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 6. Unique index pour (collection_id, slug)
    await queryInterface.addIndex("cms_entries", ["collection_id", "slug"], {
      unique: true,
      name: "unique_cms_entry_collection_slug",
    });

    // 7. Index pour site_id
    await queryInterface.addIndex("cms_entries", ["site_id"], {
      name: "cms_entries_site_id_idx",
    });

    // 8. Index pour status
    await queryInterface.addIndex("cms_entries", ["status"], {
      name: "cms_entries_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cms_entries");
    await queryInterface.dropTable("cms_fields");
    await queryInterface.dropTable("cms_collections");

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cms_fields_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cms_entries_status";');
  },
};