
export class PageEngine {
  // يقرر: هل التغيير يستحق نصوروا نسخة؟
  static needsVersion(oldData: any, newData: any): boolean {
    return (
      newData.content !== oldData.content ||
      newData.blocks !== oldData.blocks ||
      newData.title !== oldData.title
    );
  }

  // يقرر: هل الـ Slug تبدّل ولازم نأرشفوه؟
  static isSlugChanged(oldSlug: string, newSlug: string): boolean {
    return !!(newSlug && oldSlug !== newSlug);
  }
}