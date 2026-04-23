import { SlugResolver } from "../services/slugResolver.service";
import { SEODecisionEngine } from "../engine/seoDecision.engine";

export const getPublicPage = async (req, res) => {
  try {
    // 1. جيب النتيجة م الـ Resolver
    const result = await SlugResolver.resolve(
      Number(req.params.siteId),
      req.params.slug
    );

    // 2. خلّي الـ Engine يبني الـ Response كامل (Status + Headers + Body)
    const decision = SEODecisionEngine.build({ result });

    // 3. ابعث النتيجة "حاضرة"
    return res
      .status(decision.status)
      .set(decision.headers || {})
      .json(decision.body);

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};