import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getElementClassName
} from "../../domGuards";
import {
  extractContactLayout
} from "./extractContactLayout";

const findContactGrid = (
  element: HTMLElement
) =>
  (
    element.matches(
      ".contact-grid"
    )
      ? element
      : element.querySelector(
          ":scope > .contact-grid"
        )
  ) as HTMLElement | null;

const createClaimNode = (
  node: StructuralNode,
  contactGrid: HTMLElement
): StructuralNode =>
  contactGrid === node.element
    ? node
    : {
        ...node,
        element:
          contactGrid,
        path: [
          ...node.path,
          "contactGrid"
        ],
        children: [],
        claimed:
          false
      };

export const resolveContactLayout = (
  node: StructuralNode
) => {
  const contactGrid =
    findContactGrid(
      node.element
    );

  if (!contactGrid) {
    return null;
  }

  const contactTable =
    contactGrid.querySelector(
      ":scope > .ctable, .ctable"
    );
  const contactRows =
    contactTable?.querySelectorAll(
      ".crow"
    ).length || 0;
  const form =
    contactGrid.querySelector(
      ":scope > form.form, :scope > form, form.form"
    ) as HTMLFormElement | null;
  const fieldCount =
    form?.querySelectorAll(
      "input,select,textarea"
    ).length || 0;
  const submitCount =
    form?.querySelectorAll(
      "button,input[type='submit']"
    ).length || 0;
  const matches =
    !!contactTable &&
    contactRows >= 2 &&
    !!form &&
    fieldCount >= 1 &&
    submitCount >= 1;

  console.log(
    "CONTACT_LAYOUT_MATCH",
    {
      matches,
      sourceTag:
        node.element.tagName,
      sourceClassName:
        getElementClassName(
          node.element
        ),
      contactGridClassName:
        getElementClassName(
          contactGrid
        ),
      contactRows,
      fieldCount,
      submitCount
    }
  );

  if (!matches) {
    return null;
  }

  const claimedNode =
    createClaimNode(
      node,
      contactGrid
    );
  const payload =
    extractContactLayout(
      claimedNode
    );

  return {
    type:
      "CONTACT_LAYOUT",
    ...payload,
    claimedNode
  };
};
