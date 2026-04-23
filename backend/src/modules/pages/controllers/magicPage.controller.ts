import { SlugResolver } from "../services/slugResolver.service";
import { SEOBuilder } from "../engine/seoBuilder";

export const getPublicPage = async (req, res) => {

  const result = await SlugResolver.resolve(
    Number(req.params.siteId),
    req.params.slug
  );

  if (result.type === "page") {
    return res.status(200).json({
      data: result.data,
      seo: SEOBuilder.build(result.data)
    });
  }

  if (result.type === "redirect") {
    return res.redirect(
      301,
      `/api/v2/magic-page/${req.params.siteId}/${result.to}`
    );
  }

  return res.status(404).json({
    error: "NOT_FOUND"
  });
};