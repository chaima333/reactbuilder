import { SEOEngine } from "../seo/seo.engine";
import { PageMapper } from "../mappers/page.mapper";

export const getSEOPage = async (req, res) => {

  const result = await SEOEngine.resolve(
    Number(req.params.siteId),
    req.params.slug
  );

  switch (result.type) {

    case "page":
      return res.json({
        success: true,
        data: PageMapper.toDTO(result.page),
        seo: result.seo
      });

    case "redirect":
      return res.json({
        success: true,
        type: "redirect",
        to: result.to
      });

    default:
      return res.status(404).json({
        success: false
      });
  }
};