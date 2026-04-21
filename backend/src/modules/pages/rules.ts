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
  draft: ["published", "deleted"],     // ✅ توّة الـ draft ينجم يتعدى لـ published طول
  published: ["draft", "deleted"],     // ينجم يرجع مسودة أو يتمسح
  deleted: ["draft"],                  // الممسوح يرجع كان draft
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