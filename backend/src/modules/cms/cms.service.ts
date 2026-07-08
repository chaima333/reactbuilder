// cms.service.ts
import { CmsCollection, CmsField, CmsEntry } from "../../models";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
        { model: CmsEntry, required: false }
      ]
    });
  }

  // ✅ الدالة الجديدة
  static async getCollectionBySlug(siteId: number, slug: string) {
    return CmsCollection.findOne({
      where: { siteId, slug },
      include: [
        { model: CmsField, required: false },
        { model: CmsEntry, required: false }
      ]
    });
  }

  static async createCollection(
    siteId: number,
    payload: { name: string; slug?: string; description?: string }
  ) {
    const name = String(payload.name || "").trim();
    if (!name) throw new Error("COLLECTION_NAME_REQUIRED");

    const slug = slugify(payload.slug || name);
    if (!slug) throw new Error("COLLECTION_SLUG_REQUIRED");

    const existing = await CmsCollection.findOne({
      where: { siteId, slug }
    });

    if (existing) throw new Error("COLLECTION_SLUG_EXISTS");

    return CmsCollection.create({
      siteId,
      name,
      slug,
      description: payload.description || null
    });
  }

  static async updateCollection(
    siteId: number,
    collectionId: number,
    payload: { name?: string; slug?: string; description?: string }
  ) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

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

    await collection.update({
      name: nextName,
      slug: nextSlug,
      description: payload.description !== undefined ? payload.description : collection.description
    });

    return collection;
  }

  static async deleteCollection(siteId: number, collectionId: number) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    await collection.destroy();
    return true;
  }

  // =====================================
  // FIELDS
  // =====================================

  static async getFields(siteId: number, collectionId: number) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId }
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

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

    if (!entry) throw new Error("ENTRY_NOT_FOUND");

    return entry;
  }

  static async createEntry(
    siteId: number,
    collectionId: number,
    payload: { status?: string; data?: Record<string, any> }
  ) {
    const collection = await CmsCollection.findOne({
      where: { id: collectionId, siteId },
      include: [{ model: CmsField, required: false }]
    });

    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    const data = payload.data || {};
    const fields = collection.fields || [];

    const missingRequired = fields.find((field: any) => {
      if (!field.required) return false;
      const value = data[field.key];
      return value === undefined || value === null || value === "";
    });

    if (missingRequired) {
      throw new Error(`REQUIRED_FIELD_MISSING:${missingRequired.key}`);
    }

    const status = payload.status === "published" ? "published" : "draft";

    const baseSlug = slugify(
      String(data.title || data.name || `entry-${Date.now()}`)
    );

    let slug = baseSlug;
    const existing = await CmsEntry.findOne({
      where: { siteId, collectionId, slug }
    });

    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    return CmsEntry.create({
      siteId,
      collectionId,
      slug,
      status,
      data
    });
  }

  static async updateEntry(
    siteId: number,
    entryId: number,
    payload: { status?: string; data?: Record<string, any> }
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

    if (!entry) throw new Error("ENTRY_NOT_FOUND");

    const nextData = payload.data !== undefined ? payload.data : entry.data;
    const collection = (entry as any).collection;
    const fields = collection?.fields || [];

    const missingRequired = fields.find((field: any) => {
      if (!field.required) return false;
      const value = nextData[field.key];
      return value === undefined || value === null || value === "";
    });

    if (missingRequired) {
      throw new Error(`REQUIRED_FIELD_MISSING:${missingRequired.key}`);
    }

    const nextStatus = payload.status === "published" || payload.status === "draft"
      ? payload.status
      : entry.status;

    await entry.update({
      status: nextStatus,
      data: nextData
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

   return entries.map((entry)=>({
  id: entry.id,
  slug: entry.slug,
  status: entry.status,
  data: entry.data
}));
  }
}