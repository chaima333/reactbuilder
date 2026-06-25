import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../../../css/extractStyleProps";

const cleanStyle = (
  style: Record<string, any> = {}
) =>
  Object.fromEntries(
    Object.entries(style).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const desktopStyle = (
  style: any
) =>
  cleanStyle(
    style?.desktop || style || {}
  );

const layoutStyle = (
  element?: HTMLElement | null
) =>
  element
    ? desktopStyle(
        extractLayoutStyles(element)
      )
    : {};

const typographyStyle = (
  element?: HTMLElement | null
) =>
  element
    ? desktopStyle(
        extractTypographyStyles(element)
      )
    : {};

export const extractOfficeTable = (
  node: StructuralNode
) => {
  const root =
    node.element;

  const container =
    (
      root.querySelector(
        ".container, [class~='container']"
      ) ||
      root.closest(
        ".container, [class~='container']"
      )
    ) as HTMLElement | null;

  const header =
    root.querySelector(".sec-head") as HTMLElement | null;

  const badgeEl =
    root.querySelector(".section-tag") as HTMLElement | null;

  const titleEl =
    root.querySelector(".sec-head h1, .sec-head h2, h1, h2") as HTMLElement | null;

  const descriptionEl =
    root.querySelector(".sec-head p") as HTMLElement | null;

  const tableEl =
    root.querySelector(".offices-table") as HTMLElement | null;

  const badge =
    badgeEl?.textContent?.trim();

  const title =
    titleEl?.textContent?.trim();

  const description =
    descriptionEl?.textContent?.trim();

  const rows =
    Array.from(
      root.querySelectorAll(".office-row")
    ) as HTMLElement[];

  const items =
    rows
      .map((row, index) => {
        const cityEl =
          row.querySelector(".city") as HTMLElement | null;

        const countryEl =
          row.querySelector(".country") as HTMLElement | null;

        const roleEl =
          row.querySelector(".role") as HTMLElement | null;

        const nameEl =
          row.querySelector(".name") as HTMLElement | null;

        const city =
          cityEl?.textContent?.trim();

        const country =
          countryEl?.textContent?.trim();

        const role =
          roleEl?.textContent?.trim();

        if (!city || !role) {
          return null;
        }

        return {
          id: `office-item-${index}`,
          title: city,
          subtitle: country,
          description: role,

          rowStyle: layoutStyle(row),
          nameStyle: layoutStyle(nameEl),
          titleStyle: typographyStyle(cityEl),
          subtitleStyle: typographyStyle(countryEl),
          descriptionStyle: typographyStyle(roleEl)
        };
      })
      .filter(
        (item): item is any =>
          item !== null
      );

  return {
    badge,
    title,
    description,

    sectionStyle: layoutStyle(root),
    containerStyle: layoutStyle(container),
    headerStyle: layoutStyle(header),
    badgeStyle: typographyStyle(badgeEl),
    titleStyle: typographyStyle(titleEl),
    descriptionStyle: typographyStyle(descriptionEl),
    tableStyle: layoutStyle(tableEl),

    items
  };
};
