import { Request, Response } from "express";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";
import { PageMapper } from "../mappers/page.mapper";

export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const siteId = Number(req.params.siteId); // أو من domain لاحقًا

    const result = await RedirectGraphEngine.resolve(siteId, slug);

    // ❌ NOT FOUND
    if (!result) {
      return res.status(404).send("Page not found");
    }

    const { page, isOriginal } = result;

    // 🔁 REDIRECT (slug قديم)
    if (!isOriginal) {
      return res.redirect(301, `/pages/${page.slug}`);
    }

    // ✅ PAGE
    const seo = SEOBuilder.build(page);

    return res.status(200).json({
      data: PageMapper.toDTO(page),
      seo
    });

  } catch (err: any) {
    if (err.message === "REDIRECT_LOOP") {
      return res.status(500).send("Redirect loop detected");
    }

    return res.status(500).send("Server error");
  }
};