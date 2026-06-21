import { Request, Response } from "express";
import { User, Site, Page, Media } from "../../models";

export const exportAllData = async (
  req: Request,
  res: Response
) => {
  try {
    const [users, sites, pages, media] = await Promise.all([
      User.findAll({
        attributes: [
          "id",
          "name",
          "email",
          "role",
          "isApproved",
          "createdAt",
        ],
        limit: 100,
      }),

      Site.findAll({
        attributes: [
          "id",
          "name",
          "subdomain",
          "status",
          "createdAt",
          "updatedAt",
        ],
        limit: 200,
      }),

      Page.findAll({
        attributes: [
          "id",
          "title",
          "slug",
          "status",
          "siteId",
          "createdAt",
          "updatedAt",
        ],
        limit: 300,
      }),

      Media.findAll({
        attributes: [
          "id",
          "url",
          "type",
          "siteId",
          "createdAt",
        ],
        limit: 300,
      }),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
      mode: "metadata-only",
      counts: {
        users: users.length,
        sites: sites.length,
        pages: pages.length,
        media: media.length,
      },
      users,
      sites,
      pages,
      media,
    };

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("EXPORT_ALL_DATA_ERROR", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};