import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const extractOfficeTable = (
  node: StructuralNode
) => {

  // =====================================
  // GET OFFICE ROWS
  // =====================================

  const rows =

    Array.from(
      node.element.querySelectorAll(
        ".office-row"
      )
    );

  // =====================================
  // EXTRACT
  // =====================================

  return rows

    .map(
      (
        row,
        index
      ) => {

        const city =

          row.querySelector(
            ".city"
          )
          ?.textContent
          ?.trim();

        const country =

          row.querySelector(
            ".country"
          )
          ?.textContent
          ?.trim();

        const role =

          row.querySelector(
            ".role"
          )
          ?.textContent
          ?.trim();

        // =====================================
        // HARD FILTER
        // =====================================

        if (
          !city ||
          !role
        ) {

          return null;
        }

        return {

          id:
            `office-item-${index}`,

          title:
            country
              ? `${city} — ${country}`
              : city,

          description:
            role
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