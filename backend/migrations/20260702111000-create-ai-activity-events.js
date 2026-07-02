"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ai_activity_events",
      {
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

        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "users",
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

        generation_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "ai_generations",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
        },

        event_type: {
          type: Sequelize.STRING(80),
          allowNull: false
        },

        details: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {}
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW")
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW")
        }
      }
    );

    await queryInterface.addIndex(
      "ai_activity_events",
      ["site_id", "user_id"]
    );

    await queryInterface.addIndex(
      "ai_activity_events",
      ["event_type"]
    );

    await queryInterface.addIndex(
      "ai_activity_events",
      ["generation_id"]
    );

    await queryInterface.addIndex(
      "ai_activity_events",
      ["created_at"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "ai_activity_events"
    );
  }
};