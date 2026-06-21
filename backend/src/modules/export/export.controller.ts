import { Request, Response } from "express";
import { User, Site, Page, Media } from "../../models";

export const exportAllData = async (
  req: Request,
  res: Response
) => {
  try {
    const [users, sites, pages, media] = await Promise.all([
      User.findAll({
        attributes: {
          exclude: [
            "password",
            "resetPasswordToken",
            "resetPasswordExpires",
            "twoFactorSecret",
          ],
        },
      }),
      Site.findAll({ limit: 500 }),
      Page.findAll({ limit: 1000 }),
      Media.findAll({ limit: 1000 }),
    ]);

    const data = {
      exportedAt: new Date().toISOString(),
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

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reactbuilder-backup.json"
    );

    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error("EXPORT_ALL_DATA_ERROR", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};