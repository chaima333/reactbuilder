// ===== PAGE STATUS =====
export const PAGE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  DELETED: "deleted", // الـ Enum متاعك يعرف هذي
} as const;

// ===== ROLE PERMISSIONS =====
export const ROLE_PERMISSIONS = {
  OWNER: ["create", "edit", "publish", "delete"],
  ADMIN: ["create", "edit", "publish"],
  EDITOR: ["create", "edit"],
  VIEWER: ["read"],
};

// ===== STATUS TRANSITIONS =====
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["published", "deleted"],    
  published: ["draft", "deleted"], 
  deleted: ["draft"],                 
};

// ===== CHECK TRANSITION =====
export const canTransition = (
  currentStatus: string,
  nextStatus: string
) => {
  return STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus);
};

// ===== CHECK PERMISSION =====
export const canPublish = (role: string) => {
  return ["OWNER", "ADMIN"].includes(role);
};


// ===== BUSINESS LOGIC RULES (The Decision Maker) =====

export const VERSIONING_RULES = {
  // الحقول اللي بالحق تستحق نعملوا عليها Version (Snapshot)
  CRITICAL_FIELDS: ["title", "content", "blocks", "slug"],

  /**
   * 🧠 قرار إنشاء نسخة جديدة
   * @param changes - مصفوفة الحقول اللي تبدلت (بعد الـ Normalization)
   * @param oldN - البيانات القديمة منظفة
   * @param newN - البيانات الجديدة منظفة
   */
  shouldCreateVersion: (changes: string[], oldN: any, newN: any): boolean => {
    const hasCritical = changes.some(f => VERSIONING_RULES.CRITICAL_FIELDS.includes(f));

    // 🔬 منطق ذكي: لو التغيير الوحيد صار في الـ Content
    // ما نعملوا نسخة إلا إذا كان الفرق أكثر من 5 حروف (باش نتفادوا الـ Spam متاع التصليحات الصغيرة)
    if (changes.length === 1 && changes.includes('content')) {
      const oldLen = oldN.content?.length || 0;
      const newLen = newN.content?.length || 0;
      return Math.abs(newLen - oldLen) > 5;
    }

    return hasCritical;
  }
};

export const SEO_RULES = {
  // الحقول اللي تبديلها يخلّينا لازم نعاودوا الـ SEO Processing
  REQUIRED_FIELDS: ["title", "slug", "metaData"],

  shouldUpdateSEO: (changes: string[]): boolean => {
    // الـ SEO حساس للـ Title والـ Slug بالأساس
    return changes.some(field => SEO_RULES.REQUIRED_FIELDS.includes(field));
  }
};