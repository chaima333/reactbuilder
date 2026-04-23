import { Page } from "../../../models/page";

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
      data: Page; 
      canonical: string; 
      trace?: any 
    }
  | { 
      type: "redirect"; 
      to: string; 
      reason: string; 
      canonical: string; 
      trace?: any 
    }
  | { 
      type: "not_found"; 
      reason: string; 
      trace?: any 
    };