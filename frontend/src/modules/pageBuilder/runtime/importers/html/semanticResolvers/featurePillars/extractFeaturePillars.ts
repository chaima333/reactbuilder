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

        const heading =
          child.querySelector(
            "h1,h2,h3,h4,h5,h6"
          );

        const subtitleElement =
          heading?.querySelector(
            ".sub, .subtitle, small"
          );

        const directTitle =
          heading
            ? Array.from(
                heading.childNodes
              )
                .filter(
                  childNode =>
                    childNode.nodeType ===
                    Node.TEXT_NODE
                )
                .map(
                  childNode =>
                    childNode.textContent || ""
                )
                .join(" ")
                .replace(/\s+/g, " ")
                .trim()
            : "";

        const title =
          directTitle ||
          heading?.textContent
            ?.replace(
              subtitleElement?.textContent || "",
              ""
            )
            .replace(/\s+/g, " ")
            .trim();

        const subtitle =
          subtitleElement?.textContent
            ?.replace(/\s+/g, " ")
            .trim();

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
            [
              subtitle,
              description
            ]
              .filter(Boolean)
              .join("\n")
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
