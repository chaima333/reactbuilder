import {
  CmsCollection,
  CmsEntry,
  CmsField,
  Page
} from "../../models";
import {
  resolveCmsBindingsInTree
} from "./cmsBinding.resolver";

export type PublicCmsDetailResult = {
  id: number;
  siteId: number;
  slug: string;
  status: string;
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  template: {
    pageId: number;
    title: string;
    slug: string;
    blocks: unknown[];
  };
  templatePage: {
    id: number;
    title: string;
    slug: string;
    blocks: unknown[];
  };
  collection: {
    id: number;
    name: string;
    slug: string;
    templatePageId: number;
    fields: Array<{
      id: number;
      key: string;
      name: string;
      type: string;
    }>;
  };
};

const toPlain = (record: any) =>
  record &&
  typeof record.toJSON === "function"
    ? record.toJSON()
    : record;

export class CmsDetailService {
  static async resolvePublicDetail(
    siteId: number,
    collectionSlug: string,
    entrySlug: string
  ): Promise<PublicCmsDetailResult> {
    const collection =
      await CmsCollection.findOne({
        where: {
          siteId,
          slug: collectionSlug
        },
        include: [
          {
            model: CmsField,
            required: false
          }
        ]
      });

    if (!collection) {
      throw new Error(
        "CMS_PUBLIC_ENTRY_NOT_FOUND"
      );
    }

    if (!collection.templatePageId) {
      throw new Error(
        "CMS_TEMPLATE_NOT_CONFIGURED"
      );
    }

    const entry =
      await CmsEntry.findOne({
        where: {
          siteId,
          collectionId: collection.id,
          slug: entrySlug,
          status: "published"
        }
      });

    if (!entry) {
      throw new Error(
        "CMS_PUBLIC_ENTRY_NOT_FOUND"
      );
    }

    const templatePage =
      await Page.findOne({
        where: {
          id: collection.templatePageId,
          siteId,
          status: "published"
        }
      });

    if (!templatePage) {
      throw new Error(
        "CMS_TEMPLATE_NOT_PUBLIC"
      );
    }

    const fields =
      ((collection as any).fields ||
        []) as CmsField[];

    const plainEntry =
      toPlain(entry);

    const plainTemplate =
      toPlain(templatePage);

    const entryData =
      plainEntry?.data &&
      typeof plainEntry.data === "object"
        ? plainEntry.data
        : {};

    const resolvedBlocks =
      resolveCmsBindingsInTree(
        Array.isArray(plainTemplate?.blocks)
          ? plainTemplate.blocks
          : [],
        entryData,
        fields.map((field: any) => ({
          key: field.key
        }))
      );

    const fieldSummaries =
      fields.map((field: any) => ({
        id: field.id,
        key: field.key,
        name: field.name,
        type: field.type
      }));

    return {
      id: plainEntry.id,
      siteId: plainEntry.siteId,
      slug: plainEntry.slug,
      status: plainEntry.status,
      data: entryData,
      createdAt: plainEntry.createdAt,
      updatedAt: plainEntry.updatedAt,
      template: {
        pageId: plainTemplate.id,
        title: plainTemplate.title,
        slug: plainTemplate.slug,
        blocks: resolvedBlocks
      },
      templatePage: {
        id: plainTemplate.id,
        title: plainTemplate.title,
        slug: plainTemplate.slug,
        blocks: resolvedBlocks
      },
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        templatePageId:
          collection.templatePageId,
        fields: fieldSummaries
      }
    };
  }
}
