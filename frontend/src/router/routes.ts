export const routes = {

  // Sites
  sites: "/sites",

  siteCreate: "/sites/create",

  siteEdit: (siteId: number) =>
    `/sites/${siteId}/edit`,

  // Pages
  sitePages: (siteId: number) =>
    `/sites/${siteId}/pages`,

  pageCreate: (siteId: number) =>
    `/sites/${siteId}/pages/new`,

  pageEdit: (
    siteId: number,
    pageId: number
  ) =>
    `/sites/${siteId}/pages/${pageId}/edit`,

  pagePreview: (
    siteId: number,
    pageId: number
  ) =>
    `/sites/${siteId}/pages/${pageId}/preview`,

  // Dashboard
  dashboard: (siteId: number) =>
    `/sites/${siteId}/dashboard`,

  // Public
  publicSite: (siteId: number) =>
    `/site/${siteId}`,

  // Auth
  login: "/login",
  register: "/register"

};