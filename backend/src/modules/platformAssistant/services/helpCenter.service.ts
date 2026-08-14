import {
  HelpArticle as HelpArticleModel,
  HelpCategory as HelpCategoryModel
} from "../../../models";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HelpArticle,
  HelpCategory,
  PlatformAssistantDoc,
  rankHelpDocuments
} from "./platformAssistant.docs";

type Locale = "fr" | "en";

type HelpListOptions = {
  locale?: string | null;
  query?: string | null;
  categorySlug?: string | null;
  limit?: number;
  includeUnpublished?: boolean;
  includeInactive?: boolean;
  fallbackOnFailure?: boolean;
};

export class HelpCenterError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);
    this.status = status;
  }
}

const localeFrom = (
  locale?: string | null
): Locale =>
  String(locale || "")
    .toLowerCase()
    .startsWith("fr")
    ? "fr"
    : "en";

const slugify = (
  value: string
) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cleanString = (
  value: unknown,
  field: string
) => {
  const text =
    String(value || "")
      .trim();

  if (!text) {
    throw new HelpCenterError(
      `${field} is required`,
      400
    );
  }

  return text;
};

const cleanOptionalString = (
  value: unknown
) =>
  value === undefined ||
  value === null
    ? ""
    : String(value).trim();

const cleanBoolean = (
  value: unknown,
  fallback: boolean
) =>
  typeof value === "boolean"
    ? value
    : fallback;

const cleanOrder = (
  value: unknown,
  fallback = 0
) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const order =
    Number(value);

  if (!Number.isFinite(order)) {
    throw new HelpCenterError(
      "order must be a number",
      400
    );
  }

  return Math.trunc(order);
};

const cleanKeywords = (
  value: unknown
) => {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item).trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
};

const staticCategoriesById =
  new Map(
    HELP_CATEGORIES.map(category => [
      category.id,
      category
    ])
  );

const localizeStaticCategory = (
  category: HelpCategory,
  locale?: string | null
) => {
  const lang =
    localeFrom(locale);

  return {
    id: category.id,
    slug: category.slug,
    name: category.name[lang],
    description: category.description[lang],
    order: category.order,
    active: category.active
  };
};

const localizeStaticArticle = (
  article: HelpArticle,
  locale?: string | null
): PlatformAssistantDoc => {
  const lang =
    localeFrom(locale);
  const category =
    staticCategoriesById.get(article.categoryId);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title[lang],
    category:
      category?.name[lang] ||
      article.categoryId,
    summary: article.summary[lang],
    content: article.content[lang],
    keywords: article.keywords,
    order: article.order,
    active: article.active,
    published: article.published
  };
};

const staticArticles = (
  options: HelpListOptions
) =>
  HELP_ARTICLES
    .filter(article =>
      (
        options.includeInactive ||
        article.active
      ) &&
      (
        options.includeUnpublished ||
        article.published
      )
    )
    .filter(article => {
      if (!options.categorySlug) {
        return true;
      }

      const category =
        staticCategoriesById.get(article.categoryId);

      return category?.slug === options.categorySlug;
    })
    .sort((a, b) => a.order - b.order)
    .map(article =>
      localizeStaticArticle(
        article,
        options.locale
      )
    );

const toCategoryDto = (
  category: any,
  locale?: string | null
) => {
  const lang =
    localeFrom(locale);

  return {
    id: category.id,
    slug: category.slug,
    name:
      lang === "fr"
        ? category.nameFr
        : category.nameEn,
    description:
      lang === "fr"
        ? category.descriptionFr || ""
        : category.descriptionEn || "",
    nameFr: category.nameFr,
    nameEn: category.nameEn,
    descriptionFr: category.descriptionFr || "",
    descriptionEn: category.descriptionEn || "",
    order: category.order,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
};

const toArticleDto = (
  article: any,
  locale?: string | null
): PlatformAssistantDoc & Record<string, any> => {
  const lang =
    localeFrom(locale);
  const category =
    article.category;

  return {
    id: article.id,
    categoryId: article.categoryId,
    slug: article.slug,
    title:
      lang === "fr"
        ? article.titleFr
        : article.titleEn,
    category:
      category
        ? (
            lang === "fr"
              ? category.nameFr
              : category.nameEn
          )
        : "",
    summary:
      lang === "fr"
        ? article.summaryFr
        : article.summaryEn,
    content:
      lang === "fr"
        ? article.contentFr
        : article.contentEn,
    titleFr: article.titleFr,
    titleEn: article.titleEn,
    summaryFr: article.summaryFr,
    summaryEn: article.summaryEn,
    contentFr: article.contentFr,
    contentEn: article.contentEn,
    keywords:
      Array.isArray(article.keywords)
        ? article.keywords
        : [],
    order: article.order,
    active: article.active,
    published: article.published,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt
  };
};

export class HelpCenterService {
  private static seeded = false;

  static resetSeedStateForTests() {
    this.seeded = false;
  }

  static async ensureSeeded() {
    if (this.seeded) {
      return;
    }

    const count =
      await HelpCategoryModel.count();

    if (count > 0) {
      this.seeded = true;
      return;
    }

    const createdCategories =
      new Map<string, any>();

    for (const category of HELP_CATEGORIES) {
      const created =
        await HelpCategoryModel.create({
          slug: category.slug,
          nameFr: category.name.fr,
          nameEn: category.name.en,
          descriptionFr: category.description.fr,
          descriptionEn: category.description.en,
          order: category.order,
          active: category.active
        });

      createdCategories.set(
        category.id,
        created
      );
    }

    for (const article of HELP_ARTICLES) {
      const category =
        createdCategories.get(article.categoryId);

      if (!category) {
        continue;
      }

      await HelpArticleModel.create({
        categoryId: category.id,
        slug: article.slug,
        titleFr: article.title.fr,
        titleEn: article.title.en,
        summaryFr: article.summary.fr,
        summaryEn: article.summary.en,
        contentFr: article.content.fr,
        contentEn: article.content.en,
        keywords: article.keywords,
        order: article.order,
        active: article.active,
        published: article.published
      });
    }

    this.seeded = true;
  }

  static async listCategories(
    options: HelpListOptions = {}
  ) {
    try {
      await this.ensureSeeded();

      const categories =
        await HelpCategoryModel.findAll({
          where:
            options.includeInactive
              ? {}
              : {
                  active: true
                },
          order: [
            ["order", "ASC"]
          ]
        });

      return categories.map(category =>
        toCategoryDto(
          category,
          options.locale
        )
      );
    } catch (error) {
      if (options.fallbackOnFailure) {
        console.warn(
          "HELP_CENTER_CATEGORY_FALLBACK",
          error instanceof Error
            ? error.message
            : "unknown"
        );

        return HELP_CATEGORIES
          .filter(category =>
            options.includeInactive ||
            category.active
          )
          .sort((a, b) => a.order - b.order)
          .map(category =>
            localizeStaticCategory(
              category,
              options.locale
            )
          );
      }

      throw error;
    }
  }

  static async listArticles(
    options: HelpListOptions = {}
  ) {
    try {
      await this.ensureSeeded();

      const categoryWhere: Record<string, any> = {};

      if (!options.includeInactive) {
        categoryWhere.active = true;
      }

      if (options.categorySlug) {
        categoryWhere.slug = options.categorySlug;
      }

      const articles =
        await HelpArticleModel.findAll({
          where: {
            ...(options.includeInactive
              ? {}
              : {
                  active: true
                }),
            ...(options.includeUnpublished
              ? {}
              : {
                  published: true
                })
          },
          include: [
            {
              model: HelpCategoryModel,
              as: "category",
              where: categoryWhere,
              required: true
            }
          ],
          order: [
            ["order", "ASC"]
          ]
        });

      const docs =
        articles.map(article =>
          toArticleDto(
            article,
            options.locale
          )
        );

      return options.query?.trim()
        ? rankHelpDocuments(
            docs,
            options.query,
            options.limit || 12
          )
        : docs.slice(0, options.limit);
    } catch (error) {
      if (options.fallbackOnFailure) {
        console.warn(
          "HELP_CENTER_ARTICLE_FALLBACK",
          error instanceof Error
            ? error.message
            : "unknown"
        );

        const docs =
          staticArticles(options);

        return options.query?.trim()
          ? rankHelpDocuments(
              docs,
              options.query,
              options.limit || 12
            )
          : docs.slice(0, options.limit);
      }

      throw error;
    }
  }

  static async getArticleBySlug(
    slug: string,
    options: HelpListOptions = {}
  ) {
    try {
      await this.ensureSeeded();

      const article =
        await HelpArticleModel.findOne({
          where: {
            slug,
            ...(options.includeInactive
              ? {}
              : {
                  active: true
                }),
            ...(options.includeUnpublished
              ? {}
              : {
                  published: true
                })
          },
          include: [
            {
              model: HelpCategoryModel,
              as: "category",
              where:
                options.includeInactive
                  ? {}
                  : {
                      active: true
                    },
              required: true
            }
          ]
        });

      return article
        ? toArticleDto(
            article,
            options.locale
          )
        : null;
    } catch (error) {
      if (options.fallbackOnFailure) {
        console.warn(
          "HELP_CENTER_DETAIL_FALLBACK",
          error instanceof Error
            ? error.message
            : "unknown"
        );

        return staticArticles(options)
          .find(article => article.slug === slug) ||
          null;
      }

      throw error;
    }
  }

  static async retrieveRelevantArticles(
    query: string,
    locale?: string | null,
    limit = 4
  ) {
    return this.listArticles({
      locale,
      query,
      limit,
      fallbackOnFailure: true
    });
  }

  static async createCategory(
    payload: Record<string, any>
  ) {
    const slug =
      slugify(
        payload.slug ||
        payload.nameEn ||
        payload.nameFr
      );

    if (!slug) {
      throw new HelpCenterError(
        "Category slug is required",
        400
      );
    }

    const existing =
      await HelpCategoryModel.findOne({
        where: {
          slug
        }
      });

    if (existing) {
      throw new HelpCenterError(
        "Category slug already exists",
        409
      );
    }

    return HelpCategoryModel.create({
      slug,
      nameFr:
        cleanString(
          payload.nameFr,
          "French category name"
        ),
      nameEn:
        cleanString(
          payload.nameEn,
          "English category name"
        ),
      descriptionFr:
        cleanOptionalString(payload.descriptionFr),
      descriptionEn:
        cleanOptionalString(payload.descriptionEn),
      order:
        cleanOrder(payload.order),
      active:
        cleanBoolean(
          payload.active,
          true
        )
    });
  }

  static async updateCategory(
    id: number,
    payload: Record<string, any>
  ) {
    const category =
      await HelpCategoryModel.findByPk(id);

    if (!category) {
      throw new HelpCenterError(
        "Category not found",
        404
      );
    }

    const nextSlug =
      payload.slug !== undefined
        ? slugify(payload.slug)
        : category.slug;

    if (!nextSlug) {
      throw new HelpCenterError(
        "Category slug is required",
        400
      );
    }

    if (nextSlug !== category.slug) {
      const existing =
        await HelpCategoryModel.findOne({
          where: {
            slug: nextSlug
          }
        });

      if (existing) {
        throw new HelpCenterError(
          "Category slug already exists",
          409
        );
      }
    }

    await category.update({
      slug: nextSlug,
      nameFr:
        payload.nameFr !== undefined
          ? cleanString(payload.nameFr, "French category name")
          : category.nameFr,
      nameEn:
        payload.nameEn !== undefined
          ? cleanString(payload.nameEn, "English category name")
          : category.nameEn,
      descriptionFr:
        payload.descriptionFr !== undefined
          ? cleanOptionalString(payload.descriptionFr)
          : category.descriptionFr,
      descriptionEn:
        payload.descriptionEn !== undefined
          ? cleanOptionalString(payload.descriptionEn)
          : category.descriptionEn,
      order:
        payload.order !== undefined
          ? cleanOrder(payload.order)
          : category.order,
      active:
        cleanBoolean(
          payload.active,
          category.active
        )
    });

    return category;
  }

  static async deactivateCategory(
    id: number
  ) {
    const category =
      await HelpCategoryModel.findByPk(id);

    if (!category) {
      throw new HelpCenterError(
        "Category not found",
        404
      );
    }

    await category.update({
      active: false
    });

    return category;
  }

  static async createArticle(
    payload: Record<string, any>
  ) {
    const category =
      await HelpCategoryModel.findByPk(
        Number(payload.categoryId)
      );

    if (!category) {
      throw new HelpCenterError(
        "Invalid category",
        400
      );
    }

    const slug =
      slugify(
        payload.slug ||
        payload.titleEn ||
        payload.titleFr
      );

    if (!slug) {
      throw new HelpCenterError(
        "Article slug is required",
        400
      );
    }

    const existing =
      await HelpArticleModel.findOne({
        where: {
          slug
        }
      });

    if (existing) {
      throw new HelpCenterError(
        "Article slug already exists",
        409
      );
    }

    return HelpArticleModel.create({
      categoryId: category.id,
      slug,
      titleFr:
        cleanString(
          payload.titleFr,
          "French title"
        ),
      titleEn:
        cleanString(
          payload.titleEn,
          "English title"
        ),
      summaryFr:
        cleanString(
          payload.summaryFr,
          "French summary"
        ),
      summaryEn:
        cleanString(
          payload.summaryEn,
          "English summary"
        ),
      contentFr:
        cleanString(
          payload.contentFr,
          "French content"
        ),
      contentEn:
        cleanString(
          payload.contentEn,
          "English content"
        ),
      keywords:
        cleanKeywords(payload.keywords),
      order:
        cleanOrder(payload.order),
      published:
        cleanBoolean(
          payload.published,
          false
        ),
      active:
        cleanBoolean(
          payload.active,
          true
        )
    });
  }

  static async updateArticle(
    id: number,
    payload: Record<string, any>
  ) {
    const article =
      await HelpArticleModel.findByPk(id);

    if (!article) {
      throw new HelpCenterError(
        "Article not found",
        404
      );
    }

    let nextCategoryId =
      article.categoryId;

    if (payload.categoryId !== undefined) {
      const category =
        await HelpCategoryModel.findByPk(
          Number(payload.categoryId)
        );

      if (!category) {
        throw new HelpCenterError(
          "Invalid category",
          400
        );
      }

      nextCategoryId = category.id;
    }

    const nextSlug =
      payload.slug !== undefined
        ? slugify(payload.slug)
        : article.slug;

    if (!nextSlug) {
      throw new HelpCenterError(
        "Article slug is required",
        400
      );
    }

    if (nextSlug !== article.slug) {
      const existing =
        await HelpArticleModel.findOne({
          where: {
            slug: nextSlug
          }
        });

      if (existing) {
        throw new HelpCenterError(
          "Article slug already exists",
          409
        );
      }
    }

    await article.update({
      categoryId: nextCategoryId,
      slug: nextSlug,
      titleFr:
        payload.titleFr !== undefined
          ? cleanString(payload.titleFr, "French title")
          : article.titleFr,
      titleEn:
        payload.titleEn !== undefined
          ? cleanString(payload.titleEn, "English title")
          : article.titleEn,
      summaryFr:
        payload.summaryFr !== undefined
          ? cleanString(payload.summaryFr, "French summary")
          : article.summaryFr,
      summaryEn:
        payload.summaryEn !== undefined
          ? cleanString(payload.summaryEn, "English summary")
          : article.summaryEn,
      contentFr:
        payload.contentFr !== undefined
          ? cleanString(payload.contentFr, "French content")
          : article.contentFr,
      contentEn:
        payload.contentEn !== undefined
          ? cleanString(payload.contentEn, "English content")
          : article.contentEn,
      keywords:
        payload.keywords !== undefined
          ? cleanKeywords(payload.keywords)
          : article.keywords,
      order:
        payload.order !== undefined
          ? cleanOrder(payload.order)
          : article.order,
      published:
        cleanBoolean(
          payload.published,
          article.published
        ),
      active:
        cleanBoolean(
          payload.active,
          article.active
        )
    });

    return article;
  }

  static async deleteArticle(
    id: number
  ) {
    const article =
      await HelpArticleModel.findByPk(id);

    if (!article) {
      throw new HelpCenterError(
        "Article not found",
        404
      );
    }

    await article.destroy();

    return true;
  }
}
