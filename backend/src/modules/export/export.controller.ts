import { Request, Response } from "express";
import { User, Site, Page } from "../../models";

export const exportAllData = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.findAll();
    const sites = await Site.findAll();
    const pages = await Page.findAll();

    const data = {
      exportedAt: new Date(),
      users,
      sites,
      pages,
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reactbuilder-backup.json"
    );

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    return res.send(
      JSON.stringify(data, null, 2)
    );
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};