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

  console.log("FIGMA STATUS:", response.status);
  console.log(
    "FIGMA HEADERS:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("FIGMA ERROR BODY:", errorText);

    throw new Error(
      `Figma API failed with status ${response.status}: ${errorText}`
    );
  }

  return response.json();
};