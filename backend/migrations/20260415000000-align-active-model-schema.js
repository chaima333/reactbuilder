"use strict";

const currentTimestamp = (Sequelize) => ({
  type: Sequelize.DATE,
  allowNull: false,
  defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
});

const nullableTimestamp = (Sequelize) => ({
  type: Sequelize.DATE,
  allowNull: true,
});

const hasTable = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();

  return tables.some((table) => {
    const name = typeof table === "string" ? table : table.tableName;
    return name === tableName;
  });
};

const describe = async (queryInterface, tableName) => {
  if (!(await hasTable(queryInterface, tableName))) return null;
  return queryInterface.describeTable(tableName);
};

const addColumnIfMissing = async (
  queryInterface,
  tableName,
  columnName,
  definition
) => {
  const table = await describe(queryInterface, tableName);

  if (!table || table[columnName]) return;

  await queryInterface.addColumn(tableName, columnName, definition);
};

const addIndexIfMissing = async (
  queryInterface,
  tableName,
  fields,
  options
) => {
  if (!(await hasTable(queryInterface, tableName))) return;

  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some((index) => index.name === options.name)) return;

  await queryInterface.addIndex(tableName, fields, options);
};

const createTableIfMissing = async (
  queryInterface,
  tableName,
  definition
) => {
  if (await hasTable(queryInterface, tableName)) return;

  await queryInterface.createTable(tableName, definition);
};

const ensureEnumValues = async (queryInterface, enumName, values) => {
  for (const value of values) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}') THEN
          ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${value}';
        END IF;
      END
      $$;
    `);
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureEnumValues(queryInterface, "enum_users_role", [
      "ADMIN",
      "EDITOR",
      "VIEWER",
    ]);

    await ensureEnumValues(queryInterface, "enum_site_users_role", [
      "OWNER",
      "ADMIN",
      "EDITOR",
      "VIEWER",
    ]);

    if (await hasTable(queryInterface, "users")) {
      await queryInterface.sequelize.query(`
        UPDATE users
        SET role = CASE role::text
          WHEN 'Admin' THEN 'ADMIN'
          WHEN 'Editor' THEN 'EDITOR'
          WHEN 'Viewer' THEN 'VIEWER'
          ELSE role::text
        END::"enum_users_role"
        WHERE role::text IN ('Admin', 'Editor', 'Viewer');
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'VIEWER';
      `);
    }

    await addColumnIfMissing(queryInterface, "users", "google_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });

    await addColumnIfMissing(queryInterface, "users", "provider", {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "users", "is_approved", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await addColumnIfMissing(queryInterface, "users", "two_factor_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await addColumnIfMissing(queryInterface, "users", "two_factor_secret", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "sites", "title", {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: "Untitled Site",
    });

    await queryInterface.sequelize.query(`
      UPDATE sites SET title = name WHERE title = 'Untitled Site' OR title IS NULL;
    `);

    await addColumnIfMissing(queryInterface, "sites", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "sites", "favicon", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await addColumnIfMissing(queryInterface, "sites", "language", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "fr",
    });

    await addColumnIfMissing(queryInterface, "sites", "timezone", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "Europe/Paris",
    });

    await addColumnIfMissing(queryInterface, "sites", "views", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await addColumnIfMissing(queryInterface, "sites", "status", {
      type: Sequelize.ENUM("active", "suspended", "deleted"),
      allowNull: false,
      defaultValue: "active",
    });

    await addColumnIfMissing(queryInterface, "sites", "settings", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });

    await addColumnIfMissing(queryInterface, "sites", "global_layout", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });

    await createTableIfMissing(queryInterface, "pages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      blocks: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM("draft", "published", "scheduled", "deleted"),
        allowNull: false,
        defaultValue: "draft",
      },
      is_homepage: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      published_at: nullableTimestamp(Sequelize),
      meta_data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addColumnIfMissing(queryInterface, "pages", "title", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "pages", "slug", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "pages", "content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "pages", "blocks", {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
    });
    await addColumnIfMissing(
      queryInterface,
      "pages",
      "published_at",
      nullableTimestamp(Sequelize)
    );
    await addColumnIfMissing(queryInterface, "pages", "status", {
      type: Sequelize.ENUM("draft", "published", "scheduled", "deleted"),
      allowNull: false,
      defaultValue: "draft",
    });
    await addColumnIfMissing(queryInterface, "pages", "is_homepage", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing(queryInterface, "pages", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await addColumnIfMissing(queryInterface, "pages", "site_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "sites", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await addColumnIfMissing(queryInterface, "pages", "meta_data", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
    await addColumnIfMissing(queryInterface, "pages", "views", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfMissing(queryInterface, "pages", "created_at", currentTimestamp(Sequelize));
    await addColumnIfMissing(queryInterface, "pages", "updated_at", currentTimestamp(Sequelize));

    await addIndexIfMissing(queryInterface, "pages", ["site_id", "slug"], {
      unique: true,
      name: "pages_site_slug_unique",
    });

    await createTableIfMissing(queryInterface, "page_versions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      pageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "pages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      siteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      blocks: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      versionTag: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: currentTimestamp(Sequelize),
      updatedAt: currentTimestamp(Sequelize),
    });

    await addColumnIfMissing(queryInterface, "page_versions", "pageId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "pages", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await addColumnIfMissing(queryInterface, "page_versions", "siteId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "blocks", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "status", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "versionTag", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "createdBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "page_versions", "createdAt", currentTimestamp(Sequelize));
    await addColumnIfMissing(queryInterface, "page_versions", "updatedAt", currentTimestamp(Sequelize));

    await addIndexIfMissing(queryInterface, "page_versions", ["pageId"], {
      name: "page_versions_page_id_idx",
    });

    await createTableIfMissing(queryInterface, "seo", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "pages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      meta_title: { type: Sequelize.STRING(255), allowNull: true },
      meta_description: { type: Sequelize.TEXT, allowNull: true },
      meta_keywords: { type: Sequelize.STRING(255), allowNull: true },
      meta_robots: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "index,follow",
      },
      canonical_url: { type: Sequelize.STRING(500), allowNull: true },
      og_title: { type: Sequelize.STRING(255), allowNull: true },
      og_description: { type: Sequelize.TEXT, allowNull: true },
      og_image: { type: Sequelize.STRING(500), allowNull: true },
      og_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "website",
      },
      twitter_card: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "summary_large_image",
      },
      twitter_title: { type: Sequelize.STRING(255), allowNull: true },
      twitter_description: { type: Sequelize.TEXT, allowNull: true },
      twitter_image: { type: Sequelize.STRING(500), allowNull: true },
      schema_org: { type: Sequelize.JSONB, allowNull: true },
      redirect_url: { type: Sequelize.STRING(500), allowNull: true },
      redirect_type: {
        type: Sequelize.ENUM("301", "302"),
        allowNull: true,
      },
      sitemap_priority: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.5,
      },
      sitemap_changefreq: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: "weekly",
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addIndexIfMissing(queryInterface, "seo", ["page_id"], {
      name: "seo_page_id_idx",
    });
    await addIndexIfMissing(queryInterface, "seo", ["site_id"], {
      name: "seo_site_id_idx",
    });

    await createTableIfMissing(queryInterface, "page_slugs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      pageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "pages",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      siteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: currentTimestamp(Sequelize),
      updatedAt: currentTimestamp(Sequelize),
    });

    // Repair legacy page_slugs schemas safely.
    let pageSlugColumns =
      await queryInterface.describeTable(
        "page_slugs"
      );

    // Legacy DB uses page_id while the active model uses pageId.
    if (!pageSlugColumns.pageId) {
      await queryInterface.addColumn(
        "page_slugs",
        "pageId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      );

      pageSlugColumns =
        await queryInterface.describeTable(
          "page_slugs"
        );
    }

    if (pageSlugColumns.page_id) {
      await queryInterface.sequelize.query(`
        UPDATE "page_slugs"
        SET "pageId" = "page_id"
        WHERE "pageId" IS NULL;
      `);
    }

    // Legacy DB has no siteId. Recover it from the parent page.
    if (!pageSlugColumns.siteId) {
      await queryInterface.addColumn(
        "page_slugs",
        "siteId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        }
      );

      pageSlugColumns =
        await queryInterface.describeTable(
          "page_slugs"
        );
    }

    const pageColumns =
      await queryInterface.describeTable(
        "pages"
      );

    const pageSiteColumn =
      pageColumns.siteId
        ? "siteId"
        : pageColumns.site_id
          ? "site_id"
          : null;

    if (!pageSiteColumn) {
      throw new Error(
        "Cannot repair page_slugs: pages has neither siteId nor site_id"
      );
    }

    await queryInterface.sequelize.query(`
      UPDATE "page_slugs" AS ps
      SET "siteId" = p."${pageSiteColumn}"
      FROM "pages" AS p
      WHERE ps."siteId" IS NULL
        AND p."id" = ps."pageId";
    `);

    // Active PageSlug model uses camelCase timestamp columns.
    if (!pageSlugColumns.createdAt) {
      await queryInterface.addColumn(
        "page_slugs",
        "createdAt",
        {
          type: Sequelize.DATE,
          allowNull: true,
        }
      );

      pageSlugColumns =
        await queryInterface.describeTable(
          "page_slugs"
        );
    }

    if (pageSlugColumns.created_at) {
      await queryInterface.sequelize.query(`
        UPDATE "page_slugs"
        SET "createdAt" = COALESCE(
          "createdAt",
          "created_at",
          CURRENT_TIMESTAMP
        );
      `);
    } else {
      await queryInterface.sequelize.query(`
        UPDATE "page_slugs"
        SET "createdAt" = CURRENT_TIMESTAMP
        WHERE "createdAt" IS NULL;
      `);
    }

    if (!pageSlugColumns.updatedAt) {
      await queryInterface.addColumn(
        "page_slugs",
        "updatedAt",
        {
          type: Sequelize.DATE,
          allowNull: true,
        }
      );

      pageSlugColumns =
        await queryInterface.describeTable(
          "page_slugs"
        );
    }

    if (pageSlugColumns.updated_at) {
      await queryInterface.sequelize.query(`
        UPDATE "page_slugs"
        SET "updatedAt" = COALESCE(
          "updatedAt",
          "updated_at",
          "createdAt",
          CURRENT_TIMESTAMP
        );
      `);
    } else {
      await queryInterface.sequelize.query(`
        UPDATE "page_slugs"
        SET "updatedAt" = COALESCE(
          "updatedAt",
          "createdAt",
          CURRENT_TIMESTAMP
        );
      `);
    }

    const [invalidPageSlugs] =
      await queryInterface.sequelize.query(`
        SELECT COUNT(*) AS count
        FROM "page_slugs"
        WHERE "pageId" IS NULL
           OR "siteId" IS NULL
           OR "createdAt" IS NULL
           OR "updatedAt" IS NULL;
      `);

    const invalidPageSlugCount =
      Number(invalidPageSlugs[0]?.count || 0);

    if (invalidPageSlugCount > 0) {
      throw new Error(
        `Cannot repair page_slugs: ${invalidPageSlugCount} rows remain incomplete`
      );
    }

    await queryInterface.changeColumn(
      "page_slugs",
      "pageId",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    );

    await queryInterface.changeColumn(
      "page_slugs",
      "siteId",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    );

    await queryInterface.changeColumn(
      "page_slugs",
      "createdAt",
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      }
    );

    await queryInterface.changeColumn(
      "page_slugs",
      "updatedAt",
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      }
    );

    // Keep legacy page_id, created_at and is_active columns.
    // They are not deleted because existing deployments may still contain them.

    await addIndexIfMissing(
      queryInterface,
      "page_slugs",
      ["siteId", "slug"],
      {
        name: "page_slugs_site_slug_idx",
      }
    );

    await createTableIfMissing(queryInterface, "slug_maps", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      siteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("page", "redirect"),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      redirectTo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: currentTimestamp(Sequelize),
      updatedAt: currentTimestamp(Sequelize),
    });

    await addIndexIfMissing(queryInterface, "slug_maps", ["siteId", "slug"], {
      unique: true,
      name: "slug_maps_site_slug_unique",
    });

    await createTableIfMissing(queryInterface, "site_members", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.ENUM("OWNER", "ADMIN", "EDITOR", "VIEWER"),
        allowNull: false,
        defaultValue: "VIEWER",
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addIndexIfMissing(
      queryInterface,
      "site_members",
      ["user_id", "site_id"],
      {
        unique: true,
        name: "site_members_user_site_unique",
      }
    );

    if (
      (await hasTable(queryInterface, "site_users")) &&
      (await hasTable(queryInterface, "site_members"))
    ) {
      await queryInterface.sequelize.query(`
        INSERT INTO site_members (user_id, site_id, role, created_at, updated_at)
        SELECT
          user_id,
          site_id,
          CASE role::text
            WHEN 'Owner' THEN 'OWNER'
            WHEN 'Admin' THEN 'ADMIN'
            WHEN 'Editor' THEN 'EDITOR'
            WHEN 'Viewer' THEN 'VIEWER'
            ELSE role::text
          END::"enum_site_members_role",
          COALESCE(created_at, CURRENT_TIMESTAMP),
          COALESCE(updated_at, CURRENT_TIMESTAMP)
        FROM site_users
        ON CONFLICT (user_id, site_id) DO NOTHING;
      `);
    }

    await createTableIfMissing(queryInterface, "tokens", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("access", "refresh"),
        allowNull: false,
        defaultValue: "access",
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expires_at: nullableTimestamp(Sequelize),
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addIndexIfMissing(queryInterface, "tokens", ["user_id"], {
      name: "tokens_user_id_idx",
    });

    await createTableIfMissing(queryInterface, "activity_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM("site", "page", "user", "media", "plugin"),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      details: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: currentTimestamp(Sequelize),
    });

    await createTableIfMissing(queryInterface, "contact_submissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addColumnIfMissing(queryInterface, "media", "filename", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "media", "type", {
      type: Sequelize.ENUM("image", "video", "file"),
      allowNull: false,
      defaultValue: "image",
    });
    await addColumnIfMissing(queryInterface, "media", "size", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "media", "alt", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "media", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await addColumnIfMissing(queryInterface, "media", "site_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "sites", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await createTableIfMissing(queryInterface, "plugins", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "1.0.0",
      },
      author: { type: Sequelize.STRING, allowNull: true },
      category: { type: Sequelize.STRING, allowNull: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      documentation: { type: Sequelize.STRING, allowNull: true },
      repository: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM("draft", "published", "deprecated"),
        allowNull: false,
        defaultValue: "published",
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await createTableIfMissing(queryInterface, "site_plugins", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      plugin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "plugins", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      installed_at: nullableTimestamp(Sequelize),
      installed_version: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });

    await addIndexIfMissing(
      queryInterface,
      "site_plugins",
      ["site_id", "plugin_id"],
      {
        unique: true,
        name: "site_plugins_site_plugin_unique",
      }
    );

    await createTableIfMissing(queryInterface, "site_invitations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      site_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "sites", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("ADMIN", "EDITOR", "VIEWER"),
        allowNull: false,
        defaultValue: "VIEWER",
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "ACCEPTED", "CANCELLED", "EXPIRED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
      invited_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      accepted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      accepted_at: nullableTimestamp(Sequelize),
      created_at: currentTimestamp(Sequelize),
      updated_at: currentTimestamp(Sequelize),
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("SELECT 1;");
  },
};