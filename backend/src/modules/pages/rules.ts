// ===== PAGE STATUS =====
export const PAGE_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
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
  draft: ["review"],
  review: ["published", "draft"],
  published: ["archived"],
  archived: [],
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