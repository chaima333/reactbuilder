import type {
  StyleValue
} from "../../types/page.types";

export const resolveTokens = (
  style: StyleValue,
  tokens: Record<string, any>
): StyleValue => {

  const resolved = {
    ...style
  };

  Object.keys(resolved).forEach(
    (key) => {

      const typedKey =
        key as keyof StyleValue;

      const value =
        resolved[typedKey];

      if (

        typeof value === "string" &&

        value.includes(".")
      ) {

        const tokenValue =
          value
            .split(".")
            .reduce(

              (obj, part) =>
                obj?.[part],

              tokens
            );

        if (tokenValue) {

          resolved[typedKey] =
            tokenValue as never;
        }
      }
    }
  );

  return resolved;
};