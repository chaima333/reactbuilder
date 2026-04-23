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
      page: Page; 
      seo: any;
    }
  | { 
      type: "redirect"; 
      to: string; 
      seo: any;
    }
  | { 
      type: "not_found"; 
    };



    export type SEOResult =
  | { type: "page"; page: any; seo: any }
  | { type: "redirect"; to: string }
  | { type: "not_found" };