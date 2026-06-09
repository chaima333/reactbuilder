export const validateFeaturePillars = (
  items: any[]
): boolean => {

  if (
    !Array.isArray(items)
  ) {

    return false;
  }

  if (
    items.length < 3
  ) {

    return false;
  }

  return items.every(
    item =>

      !!item.title
  );
};