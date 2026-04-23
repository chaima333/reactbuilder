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
            canonical: `/pages/${result.data.slug}`,
            index: true,
            priority: "high"
          }
        }
      };
    }

    if (result.type === "redirect") {
      return {
        status: 301,
        headers: {
          "Cache-Control": "public, max-age=86400"
        },
        body: {
          success: true,
          type: "redirect",
          to: result.to,
          seo: {
            index: false
          }
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
          index: false,
          title: "Page not found"
        }
      }
    };
  }
}