

export class PageEngine {
  static resolveActions(oldPage: any, input: any) {
    return {
      // إذا الـ blocks تبدلت، لازمنا Version جديدة
      shouldVersion: JSON.stringify(oldPage.blocks) !== JSON.stringify(input.blocks),
      // إذا الـ slug تبدل، لازمنا Redirect
      slugChanged: input.slug && input.slug !== oldPage.slug
    };
  }
}