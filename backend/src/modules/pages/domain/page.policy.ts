import { PAGE_STATUS, STATUS_TRANSITIONS } from "../domain/rules";

export class PagePolicy {

  // ========================
  // PUBLISH RULES
  // ========================
  /*static canPublish(userRole: string, status: string): boolean {
    const allowedRoles = ["ADMIN", "EDITOR"];

    if (!allowedRoles.includes(userRole)) return false;
    if (status === PAGE_STATUS.DELETED) return false;

    return true;
  }

  static canTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      draft: ["published", "scheduled"],
      published: ["draft"],
      scheduled: ["published"],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  // ========================
  // SLUG RULES
  // ========================
  static canUseSlug(params: {
    isTaken: boolean;
    isReserved: boolean;
    isSamePage: boolean;
  }): boolean {
    const { isTaken, isReserved, isSamePage } = params;

    if (isSamePage) return true; // updating same page slug
    if (isTaken) return false;
    if (isReserved) return false;

    return true;
  }

  // ========================
  // DELETE RULES
  // ========================
  static canDelete(userRole: string, status: string): boolean {
    if (userRole !== "ADMIN") return false;
    if (status === PAGE_STATUS.PUBLISHED) return false;

    return true;
  }

  // ========================
  // RESOLVER RULES (SEO / SLUG)
  // ========================
  static resolveSlugBehavior(params: {
    page: any;
    history: any;
  }): "page" | "redirect" | "not_found" {

    const { page, history } = params;

    if (page && page.status === "published") return "page";

    if (history && page?.status === "published") return "redirect";

    return "not_found";
  }*/
 
  static canPublish(role: string, status: string) {
    if (!["ADMIN", "OWNER"].includes(role)) return false;
    if (status === "deleted") return false;
    return true;
  }

  static canTransition(from: string, to: string) {
    return STATUS_TRANSITIONS[from]?.includes(to);
  }

  static canDelete(role: string, status: string) {
    if (role !== "ADMIN") return false;
    if (status === "published") return false;
    return true;
  }

}