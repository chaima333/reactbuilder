import { FigmaImport } from "../../../../models/FigmaImport";

export const saveFigmaImportPayload = async (
  payload: any,
  source = "figma-plugin",
  siteId: number,
  userId: number
): Promise<string> => {
  const item = await FigmaImport.create({
    payload,
    source,
    siteId,
    userId
  });

  return item.id;
};

export const getFigmaImportPayload = async (
  id: string
) => {
  return FigmaImport.findByPk(id);
};