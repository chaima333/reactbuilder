// src/modules/pageBuilder/services/importExport.ts

export const downloadJsonFile = (
  filename: string,
  content: string
) => {
  const blob = new Blob(
    [content],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

export const readJsonFile = (
  file: File
): Promise<string> => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(
          reader.result as string
        );
      };

      reader.onerror = () => {
        reject(
          reader.error ||
            new Error(
              "Failed to read file"
            )
        );
      };

      reader.readAsText(file);
    }
  );
};