export const formatPage = (page: any) => ({
  id: page.id,
  title: page.title,
  slug: page.slug,
  content: page.content,
  blocks: page.blocks,
  status: page.status,
  siteId: page.siteId,
  userId: page.userId,
  createdAt: page.createdAt,
  updatedAt: page.updatedAt
});