"use strict";

const SYSTEM_PAGE_UNIQUE_INDEX =
  "pages_site_system_type_unique";

const SYSTEM_PAGE_TYPES = [
  {
    systemType: "visitor_login",
    slug: "login",
    title: "Login",
    text: "Login page design placeholder."
  },
  {
    systemType: "visitor_register",
    slug: "register",
    title: "Register",
    text: "Register page design placeholder."
  }
];

const buildSystemBlocksSql = (
  systemType,
  text
) => `
jsonb_build_array(
  jsonb_build_object(
    'id', '${systemType}-placeholder',
    'type', 'section',
    'data', jsonb_build_object(
      'props', jsonb_build_object(),
      'style', jsonb_build_object(
        'desktop', jsonb_build_object(
          'minHeight', '100vh',
          'display', 'flex',
          'alignItems', 'center',
          'justifyContent', 'center',
          'padding', '48px'
        ),
        'tablet', jsonb_build_object(),
        'mobile', jsonb_build_object(
          'padding', '24px'
        )
      )
    ),
    'children', jsonb_build_array(
      jsonb_build_object(
        'id', '${systemType}-copy',
        'type', 'text',
        'data', jsonb_build_object(
          'props', jsonb_build_object(
            'text', '${text}'
          ),
          'style', jsonb_build_object(
            'desktop', jsonb_build_object(
              'fontSize', '18px',
              'color', '#111827'
            ),
            'tablet', jsonb_build_object(),
            'mobile', jsonb_build_object()
          )
        ),
        'children', jsonb_build_array()
      )
    )
  )
)`;

const getSiteMemberUserSql = `
  SELECT sm."user_id"
  FROM "site_members" sm
  WHERE sm."site_id" = s.id
  ORDER BY
    CASE WHEN sm.role = 'OWNER' THEN 0 ELSE 1 END,
    sm."user_id" ASC
  LIMIT 1
`;

const promoteExistingSlugPageSql = ({
  systemType,
  slug,
  title
}) => `
  UPDATE "pages" p
  SET
    "system_type" = '${systemType}',
    "title" = COALESCE(NULLIF(p."title", ''), '${title}'),
    "status" = 'published',
    "visibility" = 'public',
    "is_homepage" = false,
    "published_at" = COALESCE(p."published_at", CURRENT_TIMESTAMP),
    "updated_at" = CURRENT_TIMESTAMP
  WHERE p."slug" = '${slug}'
    AND p."system_type" IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM "pages" existing
      WHERE existing."site_id" = p."site_id"
        AND existing."system_type" = '${systemType}'
        AND existing."id" <> p."id"
    );
`;

const insertMissingSystemPageSql = ({
  systemType,
  slug,
  title,
  text
}) => `
  INSERT INTO "pages" (
    "title",
    "slug",
    "content",
    "blocks",
    "status",
    "visibility",
    "is_homepage",
    "system_type",
    "user_id",
    "site_id",
    "published_at",
    "meta_data",
    "views",
    "created_at",
    "updated_at"
  )
  SELECT
    '${title}',
    '${slug}',
    '',
    ${buildSystemBlocksSql(systemType, text)},
    'published',
    'public',
    false,
    '${systemType}',
    site_user."user_id",
    s.id,
    CURRENT_TIMESTAMP,
    '{}'::jsonb,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM "sites" s
  JOIN LATERAL (${getSiteMemberUserSql}) site_user ON true
  WHERE site_user."user_id" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM "pages" existing
      WHERE existing."site_id" = s.id
        AND existing."system_type" = '${systemType}'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "pages" slug_page
      WHERE slug_page."site_id" = s.id
        AND slug_page."slug" = '${slug}'
    );
`;

const orphanedSitesSql = `
  SELECT s.id
  FROM "sites" s
  WHERE NOT EXISTS (
    SELECT 1
    FROM "site_members" sm
    WHERE sm."site_id" = s.id
  )
  ORDER BY s.id ASC;
`;

const backfillSystemPagesSql =
  SYSTEM_PAGE_TYPES
    .flatMap((page) => [
      promoteExistingSlugPageSql(page),
      insertMissingSystemPageSql(page)
    ])
    .join("\n");

module.exports = {
  SYSTEM_PAGE_UNIQUE_INDEX,
  backfillSystemPagesSql,
  orphanedSitesSql,

  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(
      async (transaction) => {
        await queryInterface.addColumn(
          "pages",
          "system_type",
          {
            type: Sequelize.ENUM(
              "visitor_login",
              "visitor_register"
            ),
            allowNull: true
          },
          { transaction }
        );

        const [orphanedSites] =
          await queryInterface.sequelize.query(
            orphanedSitesSql,
            { transaction }
          );

        if (Array.isArray(orphanedSites) && orphanedSites.length > 0) {
          console.warn(
            `[system-page-backfill] Skipping ${orphanedSites.length} site(s) without site_members: ${
              orphanedSites
                .map((site) => site.id)
                .join(", ")
            }`
          );
        }

        await queryInterface.sequelize.query(
          backfillSystemPagesSql,
          { transaction }
        );

        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX "${SYSTEM_PAGE_UNIQUE_INDEX}"
          ON "pages" ("site_id", "system_type")
          WHERE "system_type" IS NOT NULL;
        `, { transaction });
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(
      async (transaction) => {
        await queryInterface.sequelize.query(`
          DROP INDEX IF EXISTS "${SYSTEM_PAGE_UNIQUE_INDEX}";
        `, { transaction });

        await queryInterface.removeColumn(
          "pages",
          "system_type",
          { transaction }
        );

        await queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS "enum_pages_system_type";',
          { transaction }
        );
      }
    );
  }
};
