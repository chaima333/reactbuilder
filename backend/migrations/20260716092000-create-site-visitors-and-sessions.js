"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "site_visitors",
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

        full_name: {
          type: Sequelize.STRING(150),
          allowNull: false
        },

        email: {
          type: Sequelize.STRING(255),
          allowNull: false
        },

        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false
        },

        status: {
          type: Sequelize.ENUM(
            "active",
            "pending_verification",
            "suspended"
          ),
          allowNull: false,
          defaultValue: "active"
        },

        email_verified_at: {
          type: Sequelize.DATE,
          allowNull: true
        },

        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            )
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            )
        }
      }
    );

    /*
     * PostgreSQL case-insensitive uniqueness:
     *
     * Test@Email.com and test@email.com cannot
     * both exist inside the same site.
     */
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX
        "unique_site_visitors_site_email_lower"
      ON "site_visitors"
        ("site_id", LOWER("email"));
    `);

    await queryInterface.addIndex(
      "site_visitors",
      ["site_id", "status"],
      {
        name:
          "site_visitors_site_status_idx"
      }
    );

    await queryInterface.createTable(
      "site_visitor_sessions",
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

        site_visitor_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "site_visitors",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },

        token_hash: {
          type: Sequelize.STRING(128),
          allowNull: false
        },

        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },

        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
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
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            )
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue:
            Sequelize.literal(
              "CURRENT_TIMESTAMP"
            )
        }
      }
    );

    await queryInterface.addIndex(
      "site_visitor_sessions",
      ["token_hash"],
      {
        unique: true,
        name:
          "unique_site_visitor_session_token_hash"
      }
    );

    await queryInterface.addIndex(
      "site_visitor_sessions",
      ["site_id", "site_visitor_id"],
      {
        name:
          "site_visitor_sessions_site_visitor_idx"
      }
    );

    await queryInterface.addIndex(
      "site_visitor_sessions",
      ["expires_at"],
      {
        name:
          "site_visitor_sessions_expires_at_idx"
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "site_visitor_sessions"
    );

    await queryInterface.dropTable(
      "site_visitors"
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_site_visitors_status";'
    );
  }
};
