export const fetchFigmaFile = async (
  fileKey: string,
  token: string
) => {
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}`,
    {
      headers: {
        "X-Figma-Token": token
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Figma API failed with status ${response.status}`
    );
  }

  return response.json();
};