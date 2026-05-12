export const normalizeVersion = (
  version:any
) => {

  return structuredClone(
    version.blocks || []
  );
};