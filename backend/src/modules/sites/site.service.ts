import { Site } from "../../models";

export const updateSiteService = async (siteId: number, updateData: any) => {
  const [affectedCount] = await Site.update(updateData, {
    where: { id: siteId }
  });

  if (affectedCount === 0) {
    throw new Error("SITE_NOT_FOUND");
  }

  return await Site.findByPk(siteId);
};