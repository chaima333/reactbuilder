export const getNestedValue = (
  obj: any,
  path: string
) => {

  return path
    .split(".")
    .reduce(
      (acc, part) =>
        acc?.[part],
      obj
    );
};

export const setNestedValue = (
  obj: any,
  path: string,
  value: any
) => {

  const keys =
    path.split(".");

  const lastKey =
    keys.pop()!;

  const cloned =
    structuredClone(obj);

  let current =
    cloned;

  for (const key of keys) {

    current[key] =
      current[key] || {};

    current =
      current[key];
  }

  current[lastKey] =
    value;

  return cloned;
};