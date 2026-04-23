export class SEODecisionEngine {
  static build(ctx: any) {
    const { result } = ctx;

    // PAGE
    if (result.type === "page") {
      return {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60"
        },
        body: {
          data: result.data,
          seo: {
            canonical: `/pages/${result.canonical}`,
            index: true
          }
        }
      };
    }

    // REDIRECT (IMPORTANT FIX)
    if (result.type === "redirect") {
      return {
        status: 301,
        headers: {
          Location: `/pages/${result.to}`,
          "Cache-Control": "public, max-age=86400"
        },
        body: null
      };
    }

    // NOT FOUND
    return {
      status: 404,
      headers: {
        "Cache-Control": "no-store"
      },
      body: {
        error: "NOT_FOUND",
        seo: {
          index: false
        }
      }
    };
  }
}