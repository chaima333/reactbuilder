import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";

export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    // 🚀 استعمل الـ Graph Engine باش تجيب الحقيقة كاملة في ضربة وحدة
    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    if (!result || !result.page) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    // 🔄 إذا الـ Slug اللي دخل موش هو الـ Slug الحالي متاع الصفحة (يعني Redirect)
    if (!result.isOriginal) {
      // ✅ نبعثو للـ Public URL متاع الـ Frontend موش للـ API
      return res.redirect(301, `/pages/${result.page.slug}`);
    }

    // ✅ إذا السلوق صحيح، رجّع الـ Data + SEO
    return res.status(200).json({
      data: result.page,
      seo: SEOBuilder.build(result.page)
    });

  } catch (error) {
    if (error.message === "REDIRECT_LOOP") {
      return res.status(508).json({ error: "LOOP_DETECTED" });
    }
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
};