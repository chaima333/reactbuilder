export class SEODecisionEngine {

  static build(result: any) {

    if (result.type === "page") {
      return {
        status: 200,
        body: {
          success: true,
          type: "page",
          data: result.data,
          seo: {
            canonical: `/pages/${result.data.slug}`,
            index: true
          }
        }
      };
    }

    if (result.type === "redirect") {
      return {
        status: 301,
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