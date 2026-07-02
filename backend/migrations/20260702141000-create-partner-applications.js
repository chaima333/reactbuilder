"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "partner_applications",
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

        representative_full_name: {
          type: Sequelize.STRING(150),
          allowNull: false
        },

        professional_email: {
          type: Sequelize.STRING(255),
          allowNull: false
        },

        phone: {
          type: Sequelize.STRING(40),
          allowNull: false
        },

        country: {
          type: Sequelize.STRING(100),
          allowNull: false
        },

        region: {
          type: Sequelize.STRING(100),
          allowNull: true
        },

        city: {
          type: Sequelize.STRING(100),
          allowNull: false
        },

        company_name: {
          type: Sequelize.STRING(180),
          allowNull: false
        },

        legal_identifier: {
          type: Sequelize.STRING(120),
          allowNull: true
        },

        expertise_sectors: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        specializations: {
          type: Sequelize.TEXT,
          allowNull: false
        },

        years_experience: {
          type: Sequelize.INTEGER,
          allowNull: false
        },

        certification_files: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        portfolio_files: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        portfolio_text: {
          type: Sequelize.TEXT,
          allowNull: false
        },

        client_references: {
          type: Sequelize.TEXT,
          allowNull: true
        },

        availability: {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: "AVAILABLE"
        },

        current_workload: {
          type: Sequelize.INTEGER,
          allowNull: true
        },

        daily_rate: {
          type: Sequelize.INTEGER,
          allowNull: true
        },

        languages: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        work_modes: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        services: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },

        company_logo_file: {
          type: Sequelize.JSONB,
          allowNull: true
        },

        accepted_terms: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },

        status: {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: "PENDING"
        },

        suggested_level: {
          type: Sequelize.STRING(30),
          allowNull: false,
          defaultValue: "BRONZE"
        },

        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },

        reviewed_by_user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL"
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
      }
    );

    await queryInterface.addIndex(
      "partner_applications",
      ["site_id"],
      {
        name: "idx_partner_applications_site_id"
      }
    );

    await queryInterface.addIndex(
      "partner_applications",
      ["site_id", "status"],
      {
        name: "idx_partner_applications_site_status"
      }
    );

    await queryInterface.addIndex(
      "partner_applications",
      ["site_id", "professional_email"],
      {
        name: "uniq_partner_applications_site_email",
        unique: true
      }
    );

    await queryInterface.addConstraint(
      "partner_applications",
      {
        fields: ["status"],
        type: "check",
        name: "chk_partner_applications_status",
        where: {
          status: [
            "PENDING",
            "APPROVED",
            "REJECTED"
          ]
        }
      }
    );

    await queryInterface.addConstraint(
      "partner_applications",
      {
        fields: ["suggested_level"],
        type: "check",
        name: "chk_partner_applications_suggested_level",
        where: {
          suggested_level: [
            "BRONZE",
            "SILVER",
            "GOLD",
            "PLATINUM"
          ]
        }
      }
    );

    await queryInterface.addConstraint(
      "partner_applications",
      {
        fields: ["availability"],
        type: "check",
        name: "chk_partner_applications_availability",
        where: {
          availability: [
            "AVAILABLE",
            "PARTIAL",
            "UNAVAILABLE"
          ]
        }
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "partner_applications",
      "chk_partner_applications_availability"
    );

    await queryInterface.removeConstraint(
      "partner_applications",
      "chk_partner_applications_suggested_level"
    );

    await queryInterface.removeConstraint(
      "partner_applications",
      "chk_partner_applications_status"
    );

    await queryInterface.removeIndex(
      "partner_applications",
      "uniq_partner_applications_site_email"
    );

    await queryInterface.removeIndex(
      "partner_applications",
      "idx_partner_applications_site_status"
    );

    await queryInterface.removeIndex(
      "partner_applications",
      "idx_partner_applications_site_id"
    );

    await queryInterface.dropTable(
      "partner_applications"
    );
  }
};