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
export type SlugResolveResult =
  | {
      type: "page";
      data: any;
    }
  | {
      type: "redirect";
      to: string; status: number
    }
  | {
      type: "not_found";
      reason?: string;
    };