import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const extractValuesGrid = (
  node: StructuralNode
) => {

  const children =

    Array.from(
      node.element.children
    );

  const items =

    children

      .map(
        (
          child,
          index
        ) => {

          const title =

            child.querySelector(
              "h1,h2,h3,h4,h5,h6"
            )
            ?.textContent
            ?.trim();

          const description =

            child.querySelector(
              "p"
            )
            ?.textContent
            ?.trim();

          if (
            !title
          ) {

            return null;
          }

          return {

            id:
              `value-item-${index}`,

            title,

            description:
              description || ""
          };
        }
      )

      .filter(
        (
          item
        ): item is any =>

          item !== null
      );

  return items;
};