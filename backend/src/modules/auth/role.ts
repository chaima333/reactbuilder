export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;

export type Role = keyof typeof ROLES;