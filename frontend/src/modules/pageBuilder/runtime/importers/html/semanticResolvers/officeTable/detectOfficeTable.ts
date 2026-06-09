import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const detectOfficeTable = (
  node: StructuralNode
): boolean => {

  const className =

    node.element.className
      ?.toString()
      ?.toLowerCase() || "";

  // =====================================
  // STRICT CLASS MATCH
  // =====================================

  const semanticClassMatch =

    className.includes(
      "office"
    )

    ||

    className.includes(
      "offices"
    )

    ||

    className.includes(
      "branch"
    )

    ||

    className.includes(
      "location"
    );

  // =====================================
  // STRICT ROW MATCH
  // =====================================

  const officeRows =

    node.element.querySelectorAll(
      ".office-row"
    );

  const hasStructuredRows =

    officeRows.length >= 2;

  // =====================================
  // VALID OFFICE CONTENT
  // =====================================

  const validRows =

    Array.from(
      officeRows
    ).filter(
      row => {

        const city =

          row.querySelector(
            ".city"
          );

        const role =

          row.querySelector(
            ".role"
          );

        return (
          city &&
          role
        );
      }
    );

  // =====================================
  // FINAL DECISION
  // =====================================

  return (

    semanticClassMatch &&

    hasStructuredRows &&

    validRows.length >= 2
  );
};