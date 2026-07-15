"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { Sequelize } = require("sequelize");

const repoRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(repoRoot, "migrations");

const databaseUrl = process.env.MIGRATION_SMOKE_DATABASE_URL;
const adminUrl = process.env.MIGRATION_SMOKE_ADMIN_URL;

const expectedSchema = {
  users: [
    "id",
    "name",
    "email",
    "password",
    "role",
    "avatar",
    "google_id",
    "provider",
    "is_approved",
    "two_factor_enabled",
    "two_factor_secret",
    "created_at",
    "updated_at",
  ],
  sites: [
    "id",
    "name",
    "subdomain",
    "title",
    "description",
    "favicon",
    "language",
    "timezone",
    "views",
    "status",
    "settings",
    "global_layout",
    "created_at",
    "updated_at",
  ],
  media: [
    "id",
    "url",
    "original_name",
    "filename",
    "type",
    "size",
    "alt",
    "user_id",
    "site_id",
    "createdAt",
    "updatedAt",
  ],
  pages: [
    "id",
    "title",
    "slug",
    "content",
    "blocks",
    "status",
    "is_homepage",
    "user_id",
    "site_id",
    "published_at",
    "meta_data",
    "views",
    "created_at",
    "updated_at",
  ],
  page_versions: [
    "id",
    "pageId",
    "siteId",
    "title",
    "content",
    "blocks",
    "status",
    "versionTag",
    "createdBy",
    "createdAt",
    "updatedAt",
  ],
  seo: [
    "id",
    "page_id",
    "site_id",
    "meta_title",
    "meta_description",
    "meta_keywords",
    "meta_robots",
    "canonical_url",
    "og_title",
    "og_description",
    "og_image",
    "og_type",
    "twitter_card",
    "twitter_title",
    "twitter_description",
    "twitter_image",
    "schema_org",
    "redirect_url",
    "redirect_type",
    "sitemap_priority",
    "sitemap_changefreq",
    "created_at",
    "updated_at",
  ],
  page_slugs: ["id", "pageId", "siteId", "slug", "createdAt", "updatedAt"],
  slug_maps: [
    "id",
    "siteId",
    "slug",
    "pageId",
    "type",
    "isActive",
    "redirectTo",
    "createdAt",
    "updatedAt",
  ],
  site_members: ["id", "user_id", "site_id", "role", "created_at", "updated_at"],
  tokens: [
    "id",
    "token",
    "type",
    "is_revoked",
    "expires_at",
    "user_id",
    "created_at",
    "updated_at",
  ],
  activity_logs: [
    "id",
    "user_id",
    "site_id",
    "action",
    "entity_type",
    "entity_id",
    "details",
    "ip",
    "user_agent",
    "created_at",
  ],
  contact_submissions: [
    "id",
    "site_id",
    "page_id",
    "name",
    "email",
    "message",
    "is_read",
    "created_at",
    "updated_at",
  ],
  plugins: [
    "id",
    "name",
    "key",
    "description",
    "is_active",
    "version",
    "author",
    "category",
    "icon",
    "documentation",
    "repository",
    "status",
    "created_at",
    "updated_at",
  ],
  site_plugins: [
    "id",
    "site_id",
    "plugin_id",
    "config",
    "is_enabled",
    "installed_at",
    "installed_version",
    "created_at",
    "updated_at",
  ],
  site_invitations: [
    "id",
    "site_id",
    "email",
    "role",
    "token",
    "status",
    "invited_by",
    "accepted_by",
    "expires_at",
    "accepted_at",
    "created_at",
    "updated_at",
  ],
  figma_imports: [
  "id",
  "payload",
  "source",
  "user_id",
  "site_id",
  "created_at",
  "updated_at",
],
figma_plugin_tokens: [
  "id",
  "token",
  "user_id",
  "is_active",
  "created_at",
  "updated_at",
],
  platform_settings: ["id", "key", "value", "created_at", "updated_at"],
  notifications: [
    "id",
    "user_id",
    "site_id",
    "type",
    "title",
    "message",
    "is_read",
    "metadata",
    "created_at",
    "updated_at",
  ],
  ai_generations: [
    "id",
    "siteId",
    "userId",
    "prompt",
    "category",
    "pagesGenerated",
    "status",
    "createdAt",
    "updatedAt",
  ],
  ai_activity_events: [
    "id",
    "site_id",
    "user_id",
    "page_id",
    "generation_id",
    "event_type",
    "details",
    "created_at",
    "updated_at",
  ],
  partner_applications: [
    "id",
    "site_id",
    "representative_full_name",
    "professional_email",
    "phone",
    "country",
    "region",
    "city",
    "company_name",
    "legal_identifier",
    "expertise_sectors",
    "specializations",
    "years_experience",
    "certification_files",
    "portfolio_files",
    "portfolio_text",
    "client_references",
    "availability",
    "current_workload",
    "daily_rate",
    "languages",
    "work_modes",
    "services",
    "company_logo_file",
    "accepted_terms",
    "status",
    "suggested_level",
    "reviewed_at",
    "reviewed_by_user_id",
    "created_at",
    "updated_at",
  ],
  cms_collections: [
    "id",
    "site_id",
    "name",
    "slug",
    "description",
    "template_page_id",
    "created_at",
    "updated_at",
  ],
  cms_fields: [
    "id",
    "collection_id",
    "name",
    "key",
    "type",
    "required",
    "order",
    "settings",
    "created_at",
    "updated_at",
  ],
  cms_entries: [
    "id",
    "site_id",
    "collection_id",
    "slug",
    "status",
    "data",
    "created_at",
    "updated_at",
  ],
  forms: [
    "id",
    "site_id",
    "page_id",
    "name",
    "slug",
    "schema",
    "settings",
    "is_active",
    "created_at",
    "updated_at",
  ],
  form_submissions: [
    "id",
    "form_id",
    "site_id",
    "page_id",
    "values",
    "status",
    "ip_address",
    "user_agent",
    "created_at",
    "updated_at",
  ],
};

const assertSafeUrl = (urlString, label) => {
  if (!urlString) {
    throw new Error(`${label} is required`);
  }

  const parsed = new URL(urlString);
  const dbName = parsed.pathname.replace(/^\//, "");
  const lowered = urlString.toLowerCase();

  if (!/smoke|test|tmp|disposable/.test(dbName.toLowerCase())) {
    throw new Error(
      `${label} database name must include smoke, test, tmp, or disposable. Got: ${dbName}`
    );
  }

  if (lowered.includes("render.com") || lowered.includes("supabase")) {
    throw new Error(`${label} appears to target Render/Supabase; refusing`);
  }

  return { parsed, dbName };
};

const createDatabaseIfRequested = async () => {
  if (!adminUrl) return;

  const { dbName } = assertSafeUrl(databaseUrl, "MIGRATION_SMOKE_DATABASE_URL");
  assertSafeUrl(adminUrl, "MIGRATION_SMOKE_ADMIN_URL");

  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Unsafe database name: ${dbName}`);
  }

  const client = new Client({ connectionString: adminUrl });
  await client.connect();

  try {
    const exists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (exists.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created disposable database ${dbName}`);
    }
  } finally {
    await client.end();
  }
};

const getUserTables = async (sequelize) => {
  const [rows] = await sequelize.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  return rows.map((row) => row.table_name);
};

const assertEmptySchema = async (sequelize) => {
  const tables = await getUserTables(sequelize);
  const ignored = new Set(["SequelizeMeta"]);
  const nonEmpty = tables.filter((table) => !ignored.has(table));

  if (nonEmpty.length > 0 && process.env.MIGRATION_SMOKE_ALLOW_NON_EMPTY !== "1") {
    throw new Error(
      `Smoke DB is not empty: ${nonEmpty.join(", ")}. Set MIGRATION_SMOKE_ALLOW_NON_EMPTY=1 only for a known disposable DB.`
    );
  }
};

const runMigrations = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  await queryInterface.createTable("SequelizeMeta", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
  });

  const [appliedRows] = await sequelize.query('SELECT name FROM "SequelizeMeta"');
  const applied = new Set(appliedRows.map((row) => row.name));
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js"))
    .sort();

  for (const file of migrationFiles) {
    if (applied.has(file)) continue;

    console.log(`Migrating ${file}`);
    const migration = require(path.join(migrationsDir, file));
    await migration.up(queryInterface, Sequelize);
    await sequelize.query('INSERT INTO "SequelizeMeta" (name) VALUES ($1)', {
      bind: [file],
    });
  }
};

const assertExpectedSchema = async (sequelize) => {
  const missing = [];

  for (const [table, columns] of Object.entries(expectedSchema)) {
    const [tableRows] = await sequelize.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
      `,
      { bind: [table] }
    );

    if (tableRows.length === 0) {
      missing.push(`${table} table`);
      continue;
    }

    const actualColumns = new Set(tableRows.map((row) => row.column_name));

    for (const column of columns) {
      if (!actualColumns.has(column)) {
        missing.push(`${table}.${column}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing schema entries:\n- ${missing.join("\n- ")}`);
  }
};

const initializeCompiledModels = async () => {
  const connectionPath = path.join(repoRoot, "dist", "core", "database", "connection.js");

  if (!fs.existsSync(connectionPath)) {
    throw new Error("Run backend build before smoke test; dist/core/database/connection.js is missing.");
  }

  process.env.DATABASE_URL = databaseUrl;
  const { sequelize } = require(connectionPath);

  await sequelize.authenticate();
  await sequelize.close();
};

const main = async () => {
  assertSafeUrl(databaseUrl, "MIGRATION_SMOKE_DATABASE_URL");
  await createDatabaseIfRequested();

  const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
  });

  try {
    await sequelize.authenticate();
    await assertEmptySchema(sequelize);
    await runMigrations(sequelize);
    await assertExpectedSchema(sequelize);
    await initializeCompiledModels();

    console.log("Migration smoke test passed.");
    console.log("Rollback was not run: compatibility migration downs are intentionally non-destructive.");
  } finally {
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
