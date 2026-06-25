import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const detectOfficeTable = (
  node: StructuralNode
): boolean => {
  const tag =
    node.element.tagName.toLowerCase();

  if (
    tag === "body" ||
    tag === "html"
  ) {
    return false;
  }

  const className =
    node.element.className
      ?.toString()
      ?.toLowerCase() || "";

  const isOfficeTableNode =
    className.includes("offices-table") ||
    className.includes("office-table");

  const isOfficeSection =
    tag === "section" &&
    !!node.element.querySelector(
      ".offices-table, .office-row"
    );

  if (
    !isOfficeTableNode &&
    !isOfficeSection
  ) {
    return false;
  }

  const officeRows =
    node.element.querySelectorAll(
      ".office-row"
    );

  const validRows =
    Array.from(officeRows).filter(row => {
      const city =
        row.querySelector(".city");

      const role =
        row.querySelector(".role");

      return city && role;
    });

  return (
    officeRows.length >= 2 &&
    validRows.length >= 2
  );
};