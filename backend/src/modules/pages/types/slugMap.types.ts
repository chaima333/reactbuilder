export interface SlugMapAttributes {
  id?: number;
  siteId: number;
  slug: string;
  pageId: number;
  type: "page" | "redirect";
  isActive: boolean,
  createdAt: Date
}