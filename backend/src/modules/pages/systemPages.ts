import { Page } from "../../models";

export type PageSystemType =
  | "visitor_login"
  | "visitor_register";

export const PAGE_SYSTEM_TYPES = {
  VISITOR_LOGIN: "visitor_login",
  VISITOR_REGISTER: "visitor_register"
} as const;

export const SYSTEM_PAGE_SLUGS: Record<PageSystemType, string> = {
  visitor_login: "login",
  visitor_register: "register"
};

const SYSTEM_PAGE_TITLES: Record<PageSystemType, string> = {
  visitor_login: "Login",
  visitor_register: "Register"
};

const SYSTEM_PAGE_AUTH_BLOCK_TYPES: Record<PageSystemType, string> = {
  visitor_login: "visitorLogin",
  visitor_register: "visitorRegister"
};

export const isPageSystemType = (
  value: unknown
): value is PageSystemType =>
  value === PAGE_SYSTEM_TYPES.VISITOR_LOGIN ||
  value === PAGE_SYSTEM_TYPES.VISITOR_REGISTER;

export type VisitorAuthBlockCounts = {
  visitorLogin: number;
  visitorRegister: number;
};

export const countVisitorAuthBlocks = (
  blocks: unknown
): VisitorAuthBlockCounts => {
  const counts:
    VisitorAuthBlockCounts = {
      visitorLogin: 0,
      visitorRegister: 0
    };

  const visit = (
    items: unknown
  ) => {
    if (!Array.isArray(items)) {
      return;
    }

    for (const item of items) {
      if (
        !item ||
        typeof item !== "object"
      ) {
        continue;
      }

      const block =
        item as {
          type?: unknown;
          children?: unknown;
        };

      if (
        block.type ===
        "visitorLogin"
      ) {
        counts.visitorLogin += 1;
      }

      if (
        block.type ===
        "visitorRegister"
      ) {
        counts.visitorRegister += 1;
      }

      visit(block.children);
    }
  };

  visit(blocks);

  return counts;
};

export const assertPageAuthBlocksValid = (
  page: any,
  input: any
) => {
  if (
    input?.blocks === undefined
  ) {
    return;
  }

  const systemType =
    page?.systemType ||
    page?.get?.(
      "systemType"
    );

  const counts =
    countVisitorAuthBlocks(
      input.blocks
    );

  if (
    !isPageSystemType(
      systemType
    )
  ) {
    if (
      counts.visitorLogin > 1 ||
      counts.visitorRegister > 1
    ) {
      throw new Error(
        "PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
      );
    }

    if (
      counts.visitorLogin > 0 &&
      counts.visitorRegister > 0
    ) {
      throw new Error(
        "PAGE_CANNOT_MIX_VISITOR_AUTH_BLOCKS"
      );
    }

    return;
  }

  if (
    systemType ===
    PAGE_SYSTEM_TYPES.VISITOR_LOGIN
  ) {
    if (
      counts.visitorRegister > 0
    ) {
      throw new Error(
        "SYSTEM_PAGE_WRONG_VISITOR_AUTH_BLOCK"
      );
    }

    if (
      counts.visitorLogin === 0
    ) {
      throw new Error(
        "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_REQUIRED"
      );
    }

    if (
      counts.visitorLogin > 1
    ) {
      throw new Error(
        "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
      );
    }

    return;
  }

  if (
    counts.visitorLogin > 0
  ) {
    throw new Error(
      "SYSTEM_PAGE_WRONG_VISITOR_AUTH_BLOCK"
    );
  }

  if (
    counts.visitorRegister === 0
  ) {
    throw new Error(
      "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_REQUIRED"
    );
  }

  if (
    counts.visitorRegister > 1
  ) {
    throw new Error(
      "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
    );
  }
};

export const PAGE_GUARD_ERROR_RESPONSES: Record<
  string,
  { status: 400 | 409; code: string }
> = {
  SYSTEM_PAGE_CANNOT_BE_DELETED: {
    status: 409,
    code: "SYSTEM_PAGE_CANNOT_BE_DELETED"
  },
  SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED: {
    status: 409,
    code: "SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED"
  },
  SYSTEM_PAGE_CANNOT_BE_HOMEPAGE: {
    status: 409,
    code: "SYSTEM_PAGE_CANNOT_BE_HOMEPAGE"
  },
  SYSTEM_TYPE_CANNOT_BE_CHANGED: {
    status: 409,
    code: "SYSTEM_TYPE_CANNOT_BE_CHANGED"
  },
  NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE: {
    status: 400,
    code: "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE"
  },
  PAGE_VISITOR_AUTH_BLOCK_DUPLICATED: {
    status: 409,
    code:
      "PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
  },
  PAGE_CANNOT_MIX_VISITOR_AUTH_BLOCKS: {
    status: 409,
    code:
      "PAGE_CANNOT_MIX_VISITOR_AUTH_BLOCKS"
  },

SYSTEM_PAGE_VISITOR_AUTH_BLOCK_REQUIRED: {
  status: 409,
  code:
    "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_REQUIRED"
},

SYSTEM_PAGE_VISITOR_AUTH_BLOCK_DUPLICATED: {
  status: 409,
  code:
    "SYSTEM_PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
},

SYSTEM_PAGE_WRONG_VISITOR_AUTH_BLOCK: {
  status: 409,
  code:
    "SYSTEM_PAGE_WRONG_VISITOR_AUTH_BLOCK"
}
};

export const getPageGuardErrorResponse = (
  error: any
) => {
  const message =
    typeof error === "string"
      ? error
      : error?.message;

  if (!message) {
    return null;
  }

  return PAGE_GUARD_ERROR_RESPONSES[message] || null;
};

export const getDefaultSystemPageBlocks = (
  systemType: PageSystemType
) => [
  {
    id: `${systemType}-placeholder`,
    type: "section",
    data: {
      props: {},
      style: {
        desktop: {
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px"
        },
        tablet: {},
        mobile: {
          padding: "24px"
        }
      }
    },
    children: [
      {
        id: `${systemType}-auth-block`,
        type: SYSTEM_PAGE_AUTH_BLOCK_TYPES[systemType],
        data: {
          props: {},
          style: {
            desktop: {
              width: "100%",
              maxWidth: "460px"
            },
            tablet: {},
            mobile: {}
          }
        },
        children: []
      }
    ]
  }
];

export const buildSystemPageData = (
  siteId: number,
  userId: number,
  systemType: PageSystemType
) => ({
  title: SYSTEM_PAGE_TITLES[systemType],
  slug: SYSTEM_PAGE_SLUGS[systemType],
  content: "",
  blocks: getDefaultSystemPageBlocks(systemType),
  status: "published",
  visibility: "public",
  isHomepage: false,
  systemType,
  siteId,
  userId,
  publishedAt: new Date(),
  metaData: {}
});

export const createMissingSystemPagesForSite = async (
  siteId: number,
  userId: number,
  transaction?: any
) => {
  const created: Page[] = [];

  for (const systemType of Object.values(PAGE_SYSTEM_TYPES)) {
    const existing =
      await Page.findOne({
        where: {
          siteId,
          systemType
        },
        transaction
      });

    if (existing) {
      continue;
    }

    const slug =
      SYSTEM_PAGE_SLUGS[systemType];

    const existingSlugPage =
      await Page.findOne({
        where: {
          siteId,
          slug
        },
        transaction
      });

    if (existingSlugPage) {
      await existingSlugPage.update(
        {
          systemType,
          status: "published",
          isHomepage: false,
          visibility: "public",
          publishedAt:
            existingSlugPage.get("publishedAt") ||
            new Date()
        },
        { transaction }
      );

      continue;
    }

    const page =
      await Page.create(
        buildSystemPageData(
          siteId,
          userId,
          systemType
        ),
        { transaction }
      );

    created.push(page);
  }

  return created;
};

export const assertCanCreateNormalPage = (
  input: any
) => {
  if (
    input?.systemType !== undefined ||
    input?.system_type !== undefined
  ) {
    throw new Error(
      "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE"
    );
  }
  const counts =
  countVisitorAuthBlocks(
    input?.blocks
  );

if (
  counts.visitorLogin > 1 ||
  counts.visitorRegister > 1
) {
  throw new Error(
    "PAGE_VISITOR_AUTH_BLOCK_DUPLICATED"
  );
}

if (
  counts.visitorLogin > 0 &&
  counts.visitorRegister > 0
) {
  throw new Error(
    "PAGE_CANNOT_MIX_VISITOR_AUTH_BLOCKS"
  );
}
};

export const assertSystemPageMutationAllowed = (
  page: any,
  input: any
) => {
  const currentSystemType =
    page?.systemType ||
    page?.get?.("systemType");

  if (
    input?.systemType !== undefined ||
    input?.system_type !== undefined
  ) {
    throw new Error(
      currentSystemType
        ? "SYSTEM_TYPE_CANNOT_BE_CHANGED"
        : "NORMAL_PAGE_CANNOT_SET_SYSTEM_TYPE"
    );
  }

  if (!isPageSystemType(currentSystemType)) {
    return;
  }

  const requiredSlug =
    SYSTEM_PAGE_SLUGS[currentSystemType];

  if (
    input?.slug !== undefined &&
    input.slug !== requiredSlug
  ) {
    throw new Error(
      "SYSTEM_PAGE_SLUG_CANNOT_BE_CHANGED"
    );
  }

  if (input?.isHomepage === true) {
    throw new Error(
      "SYSTEM_PAGE_CANNOT_BE_HOMEPAGE"
    );
  }
};

export const assertSystemPageCanBeDeleted = (
  page: any
) => {
  const systemType =
    page?.systemType ||
    page?.get?.("systemType");

  if (isPageSystemType(systemType)) {
    throw new Error(
      "SYSTEM_PAGE_CANNOT_BE_DELETED"
    );
  }
};
