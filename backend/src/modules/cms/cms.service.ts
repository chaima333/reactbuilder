import { Op } from "sequelize";
import { CmsCollection, CmsField, CmsEntry, Page } from "../../models";
import { CmsDetailService } from "./cmsDetail.service";

export const CMS_ENTRY_SLUG_MAX_LENGTH = 160;

const slugify = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeCmsEntrySlug = (
  value: unknown
) => slugify(String(value || ""));

const truncateSlug = (
  value: string,
  maxLength = CMS_ENTRY_SLUG_MAX_LENGTH
) =>
  value
    .slice(0, maxLength)
    .replace(/-+$/g, "");

const slugWithSuffix = (
  baseSlug: string,
  suffix: number
) => {
  const suffixText =
    `-${suffix}`;

  return `${truncateSlug(
    baseSlug,
    CMS_ENTRY_SLUG_MAX_LENGTH -
      suffixText.length
  )}${suffixText}`;
};

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "";

const validateEntryData = (
  fields: any[],
  data: Record<string, any>
) => {
  const normalizedData: Record<string, any> = {
    ...data
  };

  for (const field of fields) {
    const value = normalizedData[field.key];

    if (field.required && isEmptyValue(value)) {
      throw new Error(
        `REQUIRED_FIELD_MISSING:${field.key}`
      );
    }

    if (isEmptyValue(value)) {
      continue;
    }

    switch (field.type) {
      case "text":
      case "textarea": {
        if (typeof value !== "string") {
          throw new Error(
            `INVALID_FIELD_TYPE:${field.key}:string`
          );
        }

        normalizedData[field.key] =
          value.trim();

        break;
      }

      case "number": {
        const parsed =
          typeof value === "number"
            ? value
            : Number(value);

        if (!Number.isFinite(parsed)) {
          throw new Error(
            `INVALID_FIELD_TYPE:${field.key}:number`
          );
        }

        normalizedData[field.key] =
          parsed;

        break;
      }

      case "boolean": {
        if (typeof value === "boolean") {
          break;
        }

        if (value === "true") {
          normalizedData[field.key] = true;
          break;
        }

        if (value === "false") {
          normalizedData[field.key] = false;
          break;
        }

        throw new Error(
          `INVALID_FIELD_TYPE:${field.key}:boolean`
        );
      }

      case "date": {
        if (
          typeof value !== "string" ||
          Number.isNaN(
            Date.parse(value)
          )
        ) {
          throw new Error(
            `INVALID_FIELD_TYPE:${field.key}:date`
          );
        }

        normalizedData[field.key] =
          value;

        break;
      }

      case "select": {
        const options =
          Array.isArray(
            field.settings?.options
          )
            ? field.settings.options
            : [];

        if (
          options.length === 0
        ) {
          throw new Error(
            `SELECT_OPTIONS_MISSING:${field.key}`
          );
        }

        if (
          !options.includes(value)
        ) {
          throw new Error(
            `INVALID_SELECT_OPTION:${field.key}`
          );
        }

        break;
      }

      case "image": {
        if (typeof value !== "string") {
          throw new Error(
            `INVALID_FIELD_TYPE:${field.key}:image`
          );
        }

        const imageValue =
          value.trim();

        const validImage =
          imageValue.startsWith("http://") ||
          imageValue.startsWith("https://") ||
          imageValue.startsWith("/") ||
          imageValue.startsWith("data:image/");

        if (!validImage) {
          throw new Error(
            `INVALID_IMAGE:${field.key}`
          );
        }

        normalizedData[field.key] =
          imageValue;

        break;
      }

      default:
        throw new Error(
          `UNSUPPORTED_FIELD_TYPE:${field.key}:${field.type}`
        );
    }
  }

  return normalizedData;
};

export class CmsService {
  // =====================================
  // COLLECTIONS
  // =====================================

  static async getCollections(siteId: number) {
    return CmsCollection.findAll({
      where: { siteId },
      include: [{ model: CmsField, required: false }],
      order: [["createdAt", "DESC"]]
    });
  }

  static async getCollectionById(siteId: number, collectionId: number) {
    return CmsCollection.findOne({
      where: { id: collectionId, siteId },
      include: [
        { model: CmsField, required: false },
        { model: CmsEntry, required: false },
        {
          model: Page,
          as: "templatePage",
          required: false
        }
      ]
    });
  }

  static async getCollectionBySlug(siteId: number, slug: string) {
    return CmsCollection.findOne({
      where: { siteId, slug },
      include: [
        { model: CmsField, required: false },
        { model: CmsEntry, required: false },
        {
          model: Page,
          as: "templatePage",
          required: false
        }
      ]
    });
  }

  static async createCollection(
    siteId: number,
    payload: { name: string; slug?: string; description?: string; templatePageId?: number | null }
  ) {
    const name = String(payload.name || "").trim();
    if (!name) throw new Error("COLLECTION_NAME_REQUIRED");

    const slug = slugify(payload.slug || name);
    if (!slug) throw new Error("COLLECTION_SLUG_REQUIRED");

    const existing = await CmsCollection.findOne({
      where: { siteId, slug }
    });

    if (existing) throw new Error("COLLECTION_SLUG_EXISTS");

    let templatePageId: number | null = null;

    if (payload.templatePageId) {
      const page = await Page.findOne({
        where: {
          id: payload.templatePageId,
          siteId
        }
      });

      if (!page) {
        throw new Error("TEMPLATE_PAGE_NOT_FOUND");
      }

      templatePageId = page.id;
    }

    return CmsCollection.create({
      siteId,
      name,
      slug,
      description: payload.description || null,
      templatePageId
    });
  }

  static async updateCollection(
    siteId: number,
    collectionId: number,
    payload: { name?: string; slug?: string; description?: string; templatePageId?: number | null }
  ) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("CMS_COLLECTION_NOT_FOUND");

    const nextName = payload.name !== undefined ? String(payload.name).trim() : collection.name;
    const nextSlug = payload.slug !== undefined ? slugify(payload.slug) : collection.slug;

    if (!nextName) throw new Error("COLLECTION_NAME_REQUIRED");
    if (!nextSlug) throw new Error("COLLECTION_SLUG_REQUIRED");

    if (nextSlug !== collection.slug) {
      const existing = await CmsCollection.findOne({
        where: { siteId, slug: nextSlug }
      });
      if (existing) throw new Error("COLLECTION_SLUG_EXISTS");
    }

    let templatePageId = collection.templatePageId;

    if (payload.templatePageId !== undefined) {
      if (payload.templatePageId === null) {
        templatePageId = null;
      } else {
        const page = await Page.findOne({
          where: {
            id: payload.templatePageId,
            siteId
          }
        });

        if (!page) {
          throw new Error("TEMPLATE_PAGE_NOT_FOUND");
        }

        templatePageId = page.id;
      }
    }

    await collection.update({
      name: nextName,
      slug: nextSlug,
      description: payload.description !== undefined ? payload.description : collection.description,
      templatePageId
    });

    // ✅ إعادة تحميل الـ collection مع العلاقات
    return CmsCollection.findOne({
      where: { id: collection.id, siteId },
      include: [
        { model: CmsField, required: false },
        { model: CmsEntry, required: false },
        {
          model: Page,
          as: "templatePage",
          required: false
        }
      ]
    });
  }

  static async deleteCollection(
    siteId: number,
    collectionId: number
  ) {
    const collection = await CmsCollection.findOne({
      where: {
        id: collectionId,
        siteId
      }
    });

    if (!collection) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    await collection.destroy();

    return true;
  }

  static async getPublishedEntryBySlug(
    siteId: number,
    collectionSlug: string,
    entrySlug: string
  ) {
    return CmsDetailService.resolvePublicDetail(
      siteId,
      collectionSlug,
      entrySlug
    );
  }

  static async ensureEntrySlugAvailable(
    siteId: number,
    collectionId: number,
    slug: string,
    entryId?: number
  ) {
    const where: any = {
      siteId,
      collectionId,
      slug
    };

    if (entryId) {
      where.id = {
        [Op.ne]: entryId
      };
    }

    const existing =
      await CmsEntry.findOne({
        where
      });

    if (existing) {
      throw new Error(
        "CMS_ENTRY_SLUG_CONFLICT"
      );
    }
  }

  static async generateUniqueEntrySlug(
    siteId: number,
    collectionId: number,
    rawBaseSlug: unknown
  ) {
    const baseSlug =
      truncateSlug(
        normalizeCmsEntrySlug(rawBaseSlug) ||
          "entry"
      ) || "entry";

    let candidate =
      baseSlug;

    let suffix =
      2;

    while (true) {
      const existing =
        await CmsEntry.findOne({
          where: {
            siteId,
            collectionId,
            slug: candidate
          }
        });

      if (!existing) {
        return candidate;
      }

      candidate =
        slugWithSuffix(
          baseSlug,
          suffix
        );

      suffix += 1;
    }
  }

  static normalizeExplicitEntrySlug(
    rawSlug: unknown
  ) {
    const slug =
      normalizeCmsEntrySlug(rawSlug);

    if (!slug) {
      throw new Error(
        "CMS_ENTRY_SLUG_INVALID"
      );
    }

    if (
      slug.length >
      CMS_ENTRY_SLUG_MAX_LENGTH
    ) {
      throw new Error(
        "CMS_ENTRY_SLUG_TOO_LONG"
      );
    }

    return slug;
  }

  // =====================================
  // FIELDS
  // =====================================

  static async getFields(siteId: number, collectionId: number) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("CMS_COLLECTION_NOT_FOUND");

    return CmsField.findAll({
      where: { collectionId },
      order: [["order", "ASC"], ["createdAt", "ASC"]]
    });
  }

  static async createField(
    siteId: number,
    collectionId: number,
    payload: {
      name: string;
      key?: string;
      type?: string;
      required?: boolean;
      order?: number;
      settings?: Record<string, any>;
    }
  ) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    const name = String(payload.name || "").trim();
    if (!name) throw new Error("FIELD_NAME_REQUIRED");

    const key = String(payload.key || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (!key) throw new Error("FIELD_KEY_REQUIRED");

    const allowedTypes = new Set(["text", "textarea", "number", "boolean", "image", "date", "select"]);
    const type = allowedTypes.has(payload.type || "") ? payload.type : "text";

    const existing = await CmsField.findOne({
      where: { collectionId, key }
    });

    if (existing) throw new Error("FIELD_KEY_EXISTS");

    return CmsField.create({
      collectionId,
      name,
      key,
      type,
      required: Boolean(payload.required),
      order: Number(payload.order || 0),
      settings: payload.settings || {}
    });
  }

  static async updateField(
    siteId: number,
    fieldId: number,
    payload: {
      name?: string;
      key?: string;
      type?: string;
      required?: boolean;
      order?: number;
      settings?: Record<string, any>;
    }
  ) {
    const field = await CmsField.findOne({
      where: { id: fieldId },
      include: [{ model: CmsCollection, required: true, where: { siteId } }]
    });

    if (!field) throw new Error("FIELD_NOT_FOUND");

    const nextName = payload.name !== undefined ? String(payload.name).trim() : field.name;
    if (!nextName) throw new Error("FIELD_NAME_REQUIRED");

    const nextKey = payload.key !== undefined
      ? String(payload.key).toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
      : field.key;

    if (!nextKey) throw new Error("FIELD_KEY_REQUIRED");

    if (nextKey !== field.key) {
      const existing = await CmsField.findOne({
        where: { collectionId: field.collectionId, key: nextKey }
      });
      if (existing) throw new Error("FIELD_KEY_EXISTS");
    }

    const allowedTypes = new Set(["text", "textarea", "number", "boolean", "image", "date", "select"]);
    const nextType = payload.type !== undefined && allowedTypes.has(payload.type) ? payload.type : field.type;

    await field.update({
      name: nextName,
      key: nextKey,
      type: nextType,
      required: payload.required !== undefined ? Boolean(payload.required) : field.required,
      order: payload.order !== undefined ? Number(payload.order) : field.order,
      settings: payload.settings !== undefined ? payload.settings : field.settings
    });

    return field;
  }

  static async deleteField(siteId: number, fieldId: number) {
    const field = await CmsField.findOne({
      where: { id: fieldId },
      include: [{ model: CmsCollection, required: true, where: { siteId } }]
    });

    if (!field) throw new Error("FIELD_NOT_FOUND");

    await field.destroy();
    return true;
  }

  // =====================================
  // ENTRIES
  // =====================================

  static async getEntries(siteId: number, collectionId: number) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    return CmsEntry.findAll({
      where: { siteId, collectionId },
      order: [["createdAt", "DESC"]]
    });
  }

  static async getEntryById(siteId: number, entryId: number) {
    const entry = await CmsEntry.findOne({
      where: { id: entryId, siteId }
    });

    if (!entry) throw new Error("CMS_ENTRY_NOT_FOUND");

    return entry;
  }

  static async createEntry(
    siteId: number,
    collectionId: number,
    payload: {
      status?: string;
      data?: Record<string, any>;
      slug?: string;
    }
  ) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId },
      include: [{ model: CmsField, required: false }]
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    const data = payload.data || {};
    const fields = collection.fields || [];

    const validatedData = validateEntryData(fields, data);

    const status = payload.status === "published" ? "published" : "draft";

    let slug: string;

    if (payload.slug !== undefined) {
      slug =
        CmsService
          .normalizeExplicitEntrySlug(
            payload.slug
          );

      await CmsService
        .ensureEntrySlugAvailable(
          siteId,
          collectionId,
          slug
        );
    } else {
      slug =
        await CmsService
          .generateUniqueEntrySlug(
            siteId,
            collectionId,
            validatedData.title ||
              validatedData.name ||
              "entry"
          );
    }

    return CmsEntry.create({
      siteId,
      collectionId,
      slug,
      status,
      data: validatedData
    });
  }

  static async updateEntry(
    siteId: number,
    entryId: number,
    payload: {
      status?: string;
      data?: Record<string, any>;
      slug?: string;
    }
  ) {
    const entry = await CmsEntry.findOne({
      where: { id: entryId, siteId },
      include: [
        {
          model: CmsCollection,
          required: true,
          include: [{ model: CmsField, required: false }]
        }
      ]
    });

    if (!entry) throw new Error("CMS_ENTRY_NOT_FOUND");

    const nextData = payload.data !== undefined ? payload.data : entry.data;
    const collection = (entry as any).collection;
    const fields = collection?.fields || [];

    const validatedData = validateEntryData(fields, nextData);

    const nextStatus = payload.status === "published" || payload.status === "draft"
      ? payload.status
      : entry.status;

    let nextSlug =
      entry.slug;

    if (payload.slug !== undefined) {
      nextSlug =
        CmsService
          .normalizeExplicitEntrySlug(
            payload.slug
          );

      await CmsService
        .ensureEntrySlugAvailable(
          siteId,
          entry.collectionId,
          nextSlug,
          entry.id
        );
    }

    await entry.update({
      slug: nextSlug,
      status: nextStatus,
      data: validatedData
    });

    return entry;
  }

  static async deleteEntry(siteId: number, entryId: number) {
    const entry = await CmsEntry.findOne({
      where: { id: entryId, siteId }
    });

    if (!entry) throw new Error("ENTRY_NOT_FOUND");

    await entry.destroy();
    return true;
  }

  // =====================================
  // PUBLIC
  // =====================================

  static async getPublishedEntriesByCollectionSlug(siteId: number, slug: string) {
    const collection = await CmsCollection.findOne({
      where: { siteId, slug }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    const entries = await CmsEntry.findAll({
      where: {
        siteId,
        collectionId: collection.id,
        status: "published"
      },
      order: [["createdAt", "DESC"]]
    });

    return entries.map(entry => ({
      id: entry.id,
      siteId: entry.siteId,
      slug: entry.slug,
      status: entry.status,
      data: entry.data,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug
      }
    }));
  }
}
