import {
  Form,
  Page,
  FormSubmission
} from "../../models";

const slugify = (
  value: string
) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export class FormsService {
  static async getForms(
    siteId: number
  ) {
    return Form.findAll({
      where: {
        siteId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    });
  }

  static async getFormById(
    siteId: number,
    formId: number
  ) {
    const form =
      await Form.findOne({
        where: {
          id: formId,
          siteId
        }
      });

    if (!form) {
      throw new Error(
        "FORM_NOT_FOUND"
      );
    }

    return form;
  }

  static async createForm(
    siteId: number,
    payload: {
      pageId?: number | null;
      name: string;
      slug?: string;
      schema?: Record<string, any>[];
      settings?: Record<string, any>;
      isActive?: boolean;
    }
  ) {
    const name =
      String(payload.name || "")
        .trim();

    if (!name) {
      throw new Error(
        "FORM_NAME_REQUIRED"
      );
    }

    const slug =
      slugify(
        payload.slug || name
      );

    if (!slug) {
      throw new Error(
        "FORM_SLUG_REQUIRED"
      );
    }

    const existing =
      await Form.findOne({
        where: {
          siteId,
          slug
        }
      });

    if (existing) {
      throw new Error(
        "FORM_SLUG_EXISTS"
      );
    }

    return Form.create({
      siteId,
      pageId:
        payload.pageId ?? null,
      name,
      slug,
      schema:
        Array.isArray(payload.schema)
          ? payload.schema
          : [],
      settings:
        payload.settings || {},
      isActive:
        payload.isActive ?? true
    });
  }

  static async updateForm(
    siteId: number,
    formId: number,
    payload: {
      pageId?: number | null;
      name?: string;
      slug?: string;
      schema?: Record<string, any>[];
      settings?: Record<string, any>;
      isActive?: boolean;
    }
  ) {
    const form =
      await this.getFormById(
        siteId,
        formId
      );

    let nextSlug =
      form.slug;

    if (payload.slug !== undefined) {
      nextSlug =
        slugify(payload.slug);

      if (!nextSlug) {
        throw new Error(
          "FORM_SLUG_REQUIRED"
        );
      }

      const existing =
        await Form.findOne({
          where: {
            siteId,
            slug: nextSlug
          }
        });

      if (
        existing &&
        existing.id !== form.id
      ) {
        throw new Error(
          "FORM_SLUG_EXISTS"
        );
      }
    }

    await form.update({
      pageId:
        payload.pageId !== undefined
          ? payload.pageId
          : form.pageId,

      name:
        payload.name !== undefined
          ? payload.name.trim()
          : form.name,

      slug:
        nextSlug,

      schema:
        payload.schema !== undefined
          ? payload.schema
          : form.schema,

      settings:
        payload.settings !== undefined
          ? payload.settings
          : form.settings,

      isActive:
        payload.isActive !== undefined
          ? payload.isActive
          : form.isActive
    });

    return form;
  }

  static async deleteForm(
    siteId: number,
    formId: number
  ) {
    const form =
      await this.getFormById(
        siteId,
        formId
      );

    await form.destroy();

    return true;
  }

  static async getSubmissions(
    siteId: number,
    formId: number
  ) {
    await this.getFormById(
      siteId,
      formId
    );

    return FormSubmission.findAll({
      where: {
        siteId,
        formId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    });
  }

  static async getFormBySlug(
  siteId: number,
  slug: string
) {
  const form = await Form.findOne({
    where: {
      siteId,
      slug
    }
  });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  return form;
}
static async submitForm(
  siteId: number,
  formId: number,
  payload: {
    values?: Record<string, any>;
    pageId?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }
) {
  const form =
    await Form.findOne({
      where: {
        id: formId,
        siteId,
        isActive: true
      }
    });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  const values =
    payload.values &&
    typeof payload.values === "object" &&
    !Array.isArray(payload.values)
      ? payload.values
      : {};

  const schema =
    Array.isArray(form.schema)
      ? form.schema
      : [];

  for (const field of schema) {
    const key =
      String(
        field?.key  ||
        field?.name ||
        ""
      ).trim();

    if (!key) {
      continue;
    }

    const value = values[key];

    const type =
      String(field?.type || "")
        .toLowerCase();

    if (
      field?.required &&
      type === "checkbox" &&
      value !== true
    ) {
      throw new Error(
        `REQUIRED_FIELD_MISSING:${key}`
      );
    }

    if (
      field?.required &&
      type !== "checkbox" &&
      (
        value === undefined ||
        value === null ||
        value === ""
      )
    ) {
      throw new Error(
        `REQUIRED_FIELD_MISSING:${key}`
      );
    }

    if (
      type === "email" &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      const isValidEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          String(value)
        );

      if (!isValidEmail) {
        throw new Error(
          `INVALID_EMAIL:${key}`
        );
      }
    }
  }

  let pageId =
    payload.pageId ??
    form.pageId ??
    null;

  if (
    pageId !== null &&
    pageId !== undefined
  ) {
    const page =
      await Page.findOne({
        where: {
          id: pageId,
          siteId
        }
      });

    pageId =
      page
        ? page.id
        : null;
  }

  return FormSubmission.create({
    formId: form.id,
    siteId,
    pageId,
    values,
    status: "new",
    ipAddress:
      payload.ipAddress || null,
    userAgent:
      payload.userAgent || null
  });
}

static async getPublicFormById(
  siteId: number,
  formId: number
) {
  const form =
    await Form.findOne({
      where: {
        id: formId,
        siteId,
        isActive: true
      }
    });

  if (!form) {
    throw new Error(
      "FORM_NOT_FOUND"
    );
  }

  return form;
}
}
