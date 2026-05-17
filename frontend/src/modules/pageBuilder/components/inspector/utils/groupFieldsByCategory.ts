import type {
  FieldDefinition,
  StyleFieldCategory
} from "../../../types/field.types";

type GroupedFields = {

  uncategorized: FieldDefinition[];

} & Record<
  StyleFieldCategory,
  FieldDefinition[]
>;

export const groupFieldsByCategory = (
  fields: FieldDefinition[]
): GroupedFields => {

  return fields.reduce(

    (groups, field) => {

      if (
        field.target !== "style"
      ) {

        groups.uncategorized.push(
          field
        );

        return groups;
      }

      const category =
        field.category ||
        "layout";

      groups[category].push(
        field
      );

      return groups;

    },

    {

      layout: [],

      spacing: [],

      typography: [],

      visual: [],

      uncategorized: []

    } as GroupedFields
  );
};