export type SEOResult =
  | { type: "page"; page: any; seo: any }
  | { type: "redirect"; to: string }
  | { type: "not_found" };