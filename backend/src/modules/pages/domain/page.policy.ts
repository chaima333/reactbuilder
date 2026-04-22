import { PAGE_STATUS, STATUS_TRANSITIONS } from "./rules";

export class PagePolicy {

  static canPublish(role: string, status: string) {
    return ["ADMIN", "OWNER"].includes(role) && status !== "deleted";
  }

  static canTransition(from: string, to: string) {
    return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static canDelete(role: string, status: string) {
    return role === "ADMIN" && status !== "published";
  }

  static canUseSlug(isTaken: boolean, isReserved: boolean, samePage: boolean) {
    if (samePage) return true;
    if (isTaken) return false;
    if (isReserved) return false;
    return true;
  }
}