

export class PageEngine {
  static resolveActions(oldPage: any, input: any) {
    return {
      shouldVersion: JSON.stringify(oldPage.blocks) !== JSON.stringify(input.blocks),
      slugChanged: input.slug && input.slug !== oldPage.slug
    };
  }
}