import { Page } from "../../../models/page";
import type {
  PageSystemType
} from "../../../models/page";

export type PageStatus = "draft" | "published" | "scheduled" | "deleted";

export interface PageBlock {

  id: string;

  type: string;

  data?: {

    props?: Record<
      string,
      any
    >;

    style?: Record<
      string,
      any
    >;
  };

  children?: PageBlock[];
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

export interface PageDTO {
  id: number;
  title: string;
  slug: string;
  content?: string;
  blocks?: PageBlock[];
  visibility: "public" | "members_only";
  systemType: PageSystemType | null;
  siteId: number;
  userId: number;
  isHomepage: boolean;
  publishedAt?: Date | string | null;
  metaData?: Record<string, any>;
  views?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  theme?: any;
  seo?: any;
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
