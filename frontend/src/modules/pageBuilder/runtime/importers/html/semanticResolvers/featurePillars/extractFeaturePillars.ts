import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const extractFeaturePillars = (
  node: StructuralNode
) => {

  const children =

    Array.from(
      node.element.children
    );

  return children

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
            `pillar-${index}`,

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
};