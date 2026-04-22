export type PageStatus = "draft" | "published" | "scheduled" | "deleted";
export interface PageBlock {
  type: string;
  content: string;
}
export interface PageCreateInput {
  title: string;
  content?: string;
  blocks?: PageBlock[];
  status?: PageStatus;
}
export interface PageUpdateInput {
  title?: string;
  content?: string;
  blocks?: PageBlock[];
  status?: PageStatus;
}

export type SlugResult =
  | { type: "page"; data: any }
  | { type: "redirect"; to: string }
  | { type: "not_found" };