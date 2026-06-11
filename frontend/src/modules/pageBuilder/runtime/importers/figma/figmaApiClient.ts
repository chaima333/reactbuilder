import { FigmaDocument } from "./figma.types";

export const fetchFigmaFile = async (
  fileKey: string,
  token: string
): Promise<FigmaDocument> => {
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}`,
    { headers: { "X-Figma-Token": token } }
  );
  if (!response.ok) throw new Error(`Figma API error: ${response.status}`);
  return response.json();
};