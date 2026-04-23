export class SEODecisionEngine {

  static build(result: any) {

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

  // SEODecisionEngine.ts
if (result.type === "redirect") {
  return {
    status: 200, // أو 301 حسب الـ Client setup
    body: {
      success: true,
      type: "redirect",
      to: result.to, // الـ slug النهائي فقط
      targetUrl: `/pages/${result.to}`, // الرابط اللي باش يمشي له الـ Frontend
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