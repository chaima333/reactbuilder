import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  categoryCount: vi.fn(),
  categoryCreate: vi.fn(),
  categoryFindAll: vi.fn(),
  categoryFindOne: vi.fn(),
  categoryFindByPk: vi.fn(),
  articleCreate: vi.fn(),
  articleFindAll: vi.fn(),
  articleFindOne: vi.fn(),
  articleFindByPk: vi.fn()
}));

vi.mock("../../../models", () => ({
  HelpCategory: {
    count: mocks.categoryCount,
    create: mocks.categoryCreate,
    findAll: mocks.categoryFindAll,
    findOne: mocks.categoryFindOne,
    findByPk: mocks.categoryFindByPk
  },
  HelpArticle: {
    create: mocks.articleCreate,
    findAll: mocks.articleFindAll,
    findOne: mocks.articleFindOne,
    findByPk: mocks.articleFindByPk
  }
}));

import {
  HelpCenterService
} from "./helpCenter.service";

const category = {
  id: 1,
  slug: "security",
  nameFr: "Securite",
  nameEn: "Security",
  descriptionFr: "Articles securite",
  descriptionEn: "Security articles",
  order: 1,
  active: true,
  update: vi.fn()
};

const article = {
  id: 10,
  categoryId: 1,
  slug: "visitor-authentication",
  titleFr: "Authentification visiteurs",
  titleEn: "Visitor Authentication",
  summaryFr: "Connexion visiteurs",
  summaryEn: "Visitor login",
  contentFr: "Les visiteurs peuvent se connecter.",
  contentEn: "Visitors can log in.",
  keywords: ["login", "connexion", "visitor"],
  order: 1,
  active: true,
  published: true,
  category,
  update: vi.fn(),
  destroy: vi.fn()
};

describe("HelpCenterService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HelpCenterService.resetSeedStateForTests();
    mocks.categoryCount.mockResolvedValue(1);
    mocks.categoryFindAll.mockResolvedValue([category]);
    mocks.articleFindAll.mockResolvedValue([article]);
    mocks.categoryFindOne.mockResolvedValue(null);
    mocks.articleFindOne.mockResolvedValue(null);
    mocks.categoryFindByPk.mockResolvedValue(category);
    mocks.articleFindByPk.mockResolvedValue(article);
  });

  it("searches DB-backed published articles", async () => {
    const results =
      await HelpCenterService.listArticles({
        locale: "fr-FR",
        query: "connexion"
      });

    expect(results[0]?.id).toBe(10);
    expect(results[0]?.title).toBe("Authentification visiteurs");
    expect(mocks.articleFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          published: true
        }
      })
    );
  });

  it("supports article detail by slug", async () => {
    mocks.articleFindOne.mockResolvedValue(article);

    const result =
      await HelpCenterService.getArticleBySlug(
        "visitor-authentication",
        {
          locale: "en-US"
        }
      );

    expect(result?.title).toBe("Visitor Authentication");
    expect(mocks.articleFindOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: "visitor-authentication",
          active: true,
          published: true
        })
      })
    );
  });

  it("excludes unpublished and inactive articles for normal reads", async () => {
    await HelpCenterService.listArticles();

    expect(mocks.articleFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          active: true,
          published: true
        }
      })
    );
  });

  it("includes unpublished and inactive articles for admin reads", async () => {
    await HelpCenterService.listArticles({
      includeUnpublished: true,
      includeInactive: true
    });

    expect(mocks.articleFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {}
      })
    );
  });

  it("filters by category slug", async () => {
    await HelpCenterService.listArticles({
      categorySlug: "security"
    });

    expect(mocks.articleFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: [
          expect.objectContaining({
            where: {
              active: true,
              slug: "security"
            }
          })
        ]
      })
    );
  });

  it("creates categories for admins", async () => {
    mocks.categoryCreate.mockResolvedValue(category);

    const result =
      await HelpCenterService.createCategory({
        slug: "new-category",
        nameFr: "Nouvelle categorie",
        nameEn: "New category",
        descriptionFr: "",
        descriptionEn: "",
        order: 3,
        active: true
      });

    expect(result).toBe(category);
    expect(mocks.categoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "new-category",
        nameEn: "New category"
      })
    );
  });

  it("updates categories for admins", async () => {
    await HelpCenterService.updateCategory(
      1,
      {
        nameEn: "Updated",
        active: false
      }
    );

    expect(category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        nameEn: "Updated",
        active: false
      })
    );
  });

  it("creates articles for admins", async () => {
    mocks.articleCreate.mockResolvedValue(article);

    const result =
      await HelpCenterService.createArticle({
        categoryId: 1,
        slug: "visitor-authentication",
        titleFr: "Authentification visiteurs",
        titleEn: "Visitor Authentication",
        summaryFr: "Resume",
        summaryEn: "Summary",
        contentFr: "Contenu",
        contentEn: "Content",
        keywords: "login, connexion",
        order: 1,
        published: true,
        active: true
      });

    expect(result).toBe(article);
    expect(mocks.articleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 1,
        keywords: ["login", "connexion"],
        published: true
      })
    );
  });

  it("updates articles including publish and deactivate flags", async () => {
    await HelpCenterService.updateArticle(
      10,
      {
        published: false,
        active: false
      }
    );

    expect(article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        published: false,
        active: false
      })
    );
  });

  it("rejects duplicate category slugs", async () => {
    mocks.categoryFindOne.mockResolvedValue(category);

    await expect(
      HelpCenterService.createCategory({
        slug: "security",
        nameFr: "Securite",
        nameEn: "Security"
      })
    ).rejects.toThrow("Category slug already exists");
  });

  it("rejects duplicate article slugs", async () => {
    mocks.articleFindOne.mockResolvedValue(article);

    await expect(
      HelpCenterService.createArticle({
        categoryId: 1,
        slug: "visitor-authentication",
        titleFr: "Authentification visiteurs",
        titleEn: "Visitor Authentication",
        summaryFr: "Resume",
        summaryEn: "Summary",
        contentFr: "Contenu",
        contentEn: "Content"
      })
    ).rejects.toThrow("Article slug already exists");
  });

  it("rejects invalid article categories", async () => {
    mocks.categoryFindByPk.mockResolvedValue(null);

    await expect(
      HelpCenterService.createArticle({
        categoryId: 999,
        slug: "bad",
        titleFr: "Titre",
        titleEn: "Title",
        summaryFr: "Resume",
        summaryEn: "Summary",
        contentFr: "Contenu",
        contentEn: "Content"
      })
    ).rejects.toThrow("Invalid category");
  });

  it("falls back safely for assistant retrieval when DB fails", async () => {
    mocks.categoryCount.mockRejectedValue(
      new Error("database unavailable")
    );

    const results =
      await HelpCenterService.retrieveRelevantArticles(
        "login",
        "en-US",
        2
      );

    expect(results[0]?.id).toBe("visitor-authentication");
  });
});
