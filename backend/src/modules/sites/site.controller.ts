import { Request,Response } from 'express';
import { Site, Page, SiteMember } from '../../models';
import { AuthRequest } from '../../shared/auth.util';
import { SiteService } from '../sites/site.service';
import { Op } from "sequelize";
import { EventDispatcher } from "../../core/plugins/event.dispatcher";
import { OptionalSiteVisitorAuthRequest } from '../siteVisitors/siteVisitorAuth.middleware';

// =========================
// CREATE SITE
// =========================
export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subdomain, title } = req.body;
    const userId = req.user.id;
    const canCreateSite =
  req.user.role === "ADMIN" ||
  req.user.role === "EDITOR";

if (!canCreateSite) {
  return res.status(403).json({
    success: false,
    message: "Permission denied: SITE_CREATE"
  });
}

    if (!name || !subdomain) {
      return res.status(400).json({ success: false, message: "Name and subdomain required" });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/\s+/g, "-");

   const site = await SiteService.createSite(
  userId,
  {
    name,
    subdomain: cleanSubdomain,
    title
  },
  req.user.role
);

    await EventDispatcher.dispatch(
      "site.created",
      {
        data: site,
        context: {
          userId,
          siteId: site.id
        }
      },
      "site"
    );

    return res.status(201).json({ success: true, data: site });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Subdomain already taken" });
    }
    if (error.message === "MAX_SITES_LIMIT_REACHED") {
  return res.status(403).json({
    success: false,
    message: "MAX_SITES_LIMIT_REACHED",
  });
}
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);

    const updatedSite = await SiteService.updateSiteService(
      siteId,
      req.body
    );

    return res.json({
      success: true,
      data: updatedSite
    });

  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        message: "Site not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};

export const updateGlobalLayout = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId = Number(req.params.siteId);

    const member = await SiteMember.findOne({
      where: {
        siteId,
        userId: req.user.id
      }
    });

    if (!member && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "No access to this site"
      });
    }

    const updatedSite =
      await SiteService.updateGlobalLayoutService(
        siteId,
        {
          navbar:
            req.body?.navbar ?? null,
          footer:
            req.body?.footer ?? null
        }
      );

    return res.json({
      success: true,
      data: updatedSite
    });

  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const updateSiteTheme = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      Number(req.params.siteId);

    const theme =
      req.body?.theme || req.body || {};

    const updatedSite =
      await SiteService.updateThemeService(
        siteId,
        theme
      );

    return res.json({
      success: true,
      data: updatedSite
    });

  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Theme update failed"
    });
  }
};
// =========================
// GET SITES
// =========================
export const getSites = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const memberships = await SiteMember.findAll({
      where: {
        userId
      },
      include: [
        {
          model: Site,
          where: {
            status: {
              [Op.ne]: "deleted"
            }
          },
         include: [
  {
    model: Page,
    as: "pages",
    attributes: [
      "id",
      "title",
      "systemType"
    ],
    where: {
      status: {
        [Op.ne]: "deleted"
      }
    },
    required: false
  }
]
        }
      ],
      order: [
        ["createdAt", "DESC"]
      ]
    });

    const sites = memberships
      .filter((m: any) => m.site)
      .map((m: any) => ({
        id: m.site.id,
        name: m.site.name,
        subdomain: m.site.subdomain,
        status: m.site.status,
        createdAt: m.site.createdAt,

        memberRole: m.role,
        role: m.role,

        pages: m.site.pages || [],
        pagesCount: m.site.pages
          ? m.site.pages.length
          : 0,

        totalViews: m.site.totalViews || 0,
        description: m.site.description || null
      }));

    return res.json({
      success: true,
      data: sites
    });

  } catch (error: any) {
    console.error(
      "GET_SITES_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getSiteAccess = async (req, res) => {
  const userId = req.user.id;
  const siteId = req.params.siteId;

  const member = await SiteMember.findOne({
    where: { userId, siteId }
  });

  if (!member) {
    return res.status(403).json({
      success: false,
      message: "No access to this site"
    });
  }

  return res.json({
    siteId,
    role: member.role
  });
};

// =========================
// GET SITE BY ID
// =========================//
export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const userId = req.user.id;

    const member = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "No access to this site"
      });
    }

    const site = await Site.findByPk(siteId, {
      include: [{ model: Page, as: "pages", required: false }]
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

  const raw =
  site.toJSON();

return res.json({
  success: true,
  data: {
    ...raw,
    theme:
      raw.settings?.theme || {}
  }
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const userId = req.user.id;

    const member = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "No access to this site"
      });
    }

    const [affected] = await Site.update(
      { status: "deleted" },
      { where: { id: siteId } }
    );

    if (!affected) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    return res.json({
      success: true,
      message: "deleted"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getDefaultSite = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const membership = await SiteMember.findOne({
      where: {
        userId
      },
      include: [
        {
          model: Site,
          where: {
            status: {
              [Op.ne]: "deleted"
            }
          }
        }
      ],
      order: [
        ["createdAt", "ASC"]
      ]
    });

    if (!membership || !(membership as any).site) {
      return res.json({
        success: true,
        data: null
      });
    }

    const site =
      (membership as any).site;

    return res.json({
      success: true,
      data: {
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        status: site.status,
        createdAt: site.createdAt,

        memberRole: membership.role,
        role: membership.role
      }
    });

  } catch (error: any) {
    console.error(
      "GET_DEFAULT_SITE_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getPublicSite = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId =
      Number(req.params.siteId);

    if (
      !Number.isInteger(siteId) ||
      siteId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site id"
      });
    }

    const authRequest =
      req as OptionalSiteVisitorAuthRequest;

    const isAuthenticatedVisitor =
      Boolean(authRequest.siteVisitor);

    res.set(
      "Vary",
      "Authorization"
    );

    if (isAuthenticatedVisitor) {
      res.set(
        "Cache-Control",
        "private, no-store, max-age=0"
      );
    } else {
      res.set(
        "Cache-Control",
        "public, max-age=60"
      );
    }

    const site =
      await Site.findOne({
        where: {
          id: siteId,
          status: "active"
        },

        include: [
          {
            model: Page,
            as: "pages",
            required: false,

            attributes: [
              "id",
              "title",
              "slug",
              "status",
              "visibility",
              "isHomepage",
              "publishedAt"
            ],

            where: {
              status: "published",
              systemType: null,

              ...(
                isAuthenticatedVisitor
                  ? {}
                  : {
                      visibility:
                        "public"
                    }
              )
            }
          }
        ]
      });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    return res.json({
      success: true,
      data: site
    });
  } catch (error: any) {
    console.error(
      "GET_PUBLIC_SITE_ERROR",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error"
    });
  }
};