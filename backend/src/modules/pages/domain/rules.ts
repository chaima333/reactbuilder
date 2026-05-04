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
  REQUIRED_FIELDS: ["title", "content", "blocks", "status", "slug", "metaData"],
  
  shouldCreateVersion: (changes: string[]): boolean => {
    return changes.some(field => VERSIONING_RULES.REQUIRED_FIELDS.includes(field));
  }
};

export const SEO_RULES = {
  REQUIRED_FIELDS: ["title", "slug", "metaData"],

  shouldUpdateSEO: (changes: string[]): boolean => {
    return changes.some(field => SEO_RULES.REQUIRED_FIELDS.includes(field));
  }
};