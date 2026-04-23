import { SlugResolver } from "../services/slugResolver.service";
import { SEODecisionEngine } from "../engine/seoDecision.engine";

export const getPublicPage = async (req, res) => {
  try {
    const result = await SlugResolver.resolve(
      Number(req.params.siteId),
      req.params.slug
    );

    const decision = SEODecisionEngine.build({ result });

    return res
      .status(decision.status)
      .set(decision.headers || {})
      .json(decision.body);

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};