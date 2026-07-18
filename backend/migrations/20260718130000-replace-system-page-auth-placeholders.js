"use strict";

const SYSTEM_PAGE_TYPES = [
  {
    systemType: "visitor_login",
    authBlockType: "visitorLogin",
    text: "Login page design placeholder."
  },
  {
    systemType: "visitor_register",
    authBlockType: "visitorRegister",
    text: "Register page design placeholder."
  }
];

const buildPlaceholderBlocksSql = (
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

const buildAuthBlocksSql = (
  systemType,
  authBlockType
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
        'id', '${systemType}-auth-block',
        'type', '${authBlockType}',
        'data', jsonb_build_object(
          'props', jsonb_build_object(),
          'style', jsonb_build_object(
            'desktop', jsonb_build_object(
              'width', '100%',
              'maxWidth', '460px'
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

const replacePlaceholdersSql =
  SYSTEM_PAGE_TYPES
    .map((page) => `
      UPDATE "pages"
      SET
        "blocks" = ${buildAuthBlocksSql(page.systemType, page.authBlockType)},
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "system_type" = '${page.systemType}'
        AND "blocks" = ${buildPlaceholderBlocksSql(page.systemType, page.text)};
    `)
    .join("\n");

module.exports = {
  replacePlaceholdersSql,
  buildPlaceholderBlocksSql,
  buildAuthBlocksSql,

  async up(queryInterface) {
    await queryInterface.sequelize.transaction(
      async (transaction) => {
        await queryInterface.sequelize.query(
          replacePlaceholdersSql,
          { transaction }
        );
      }
    );
  },

  async down() {
    // Intentionally irreversible: reverting would overwrite pages that were
    // edited after Phase 2A. Leave auth blocks in place.
  }
};
