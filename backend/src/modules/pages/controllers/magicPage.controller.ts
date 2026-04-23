import { SEOContextBuilder } from "../engine/seoContext.builder";
import { SEODecisionEngine } from "../engine/seoDecision.engine";
import { SlugResolver } from "../services/slugResolver.service";

export const getPublicPage = async (req, res) => {

  const result = await SlugResolver.resolve(
    Number(req.params.siteId),
    req.params.slug
  );

  const decision = SEODecisionEngine.build(result);

  return res
    .status(decision.status)
    .set(decision.headers)
    .json(decision.body);
};