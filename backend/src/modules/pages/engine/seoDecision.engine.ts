export class SEODecisionEngine {

  static build(ctx: any) {

    const { result } = ctx;

    if (result.type === "page") {
      return {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60"
        },
        body: {
          success: true,
          type: "page",
          data: result.data,
          seo: {
            canonical: `/pages/${result.canonical}`,
            index: true
          }
        }
      };
    }

    // داخل SEODecisionEngine.ts
if (result.type === "redirect") {
  return {
    status: 200, // إنت تحبها 200 باش الـ Frontend يقرأ الـ JSON
    headers: { "X-SEO-Redirect": "true" },
    body: {
      success: true,
      type: "redirect",
      to: `/pages/${result.to}`, // نزيدو الـ Prefix هوني موش في البلايص الكل
      seo: { index: false }
    }
  };
}

    return {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      },
      body: {
        success: false,
        type: "not_found",
        seo: {
          index: false
        }
      }
    };
  }
}