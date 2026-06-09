export const createDeterministicId = (
  type: string,
  path: number[]
): string => {

  return `${type}-${path.join("-")}`;
};