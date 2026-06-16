import { PageBlock } from "../pages/types/page.types";

export interface GeneratePageRequest {
  title?: string;
  prompt: string;
}

export interface GeneratedPage {
  title: string;
  blocks: PageBlock[];
}