export class SEOContextBuilder {

  static build(result: any, req: any) {
    return {
      result,
      url: req.originalUrl,
      host: req.get("host"),
      timestamp: Date.now()
    };
  }
}