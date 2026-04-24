import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";

// ✅ النسخة الصحيحة والمصلحة
export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    console.log(`[DEBUG] Attempting resolve for site: ${siteId}, slug: ${inputSlug}`);

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    if (!result || !result.page) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    if (!result.isOriginal) {
      // 🔥 هوني التصليح: لازم تزيد الـ siteId في الـ URL
      const target = `/pages/${siteId}/${result.page.slug}`;
      console.log(`[DEBUG] Redirecting to: ${target}`);
      
      return res.redirect(301, target); 
    }

    return res.status(200).json({
      success: true,
      data: result.page,
      seo: SEOBuilder.build(result.page)
    });

  } catch (error: any) {
    console.error("[DEBUG ERROR]", error.message);
    if (error.message === "REDIRECT_LOOP") {
      return res.status(508).json({ error: "LOOP_DETECTED" });
    }
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};