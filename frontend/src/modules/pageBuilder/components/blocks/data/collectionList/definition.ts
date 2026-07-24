import React from "react";

import ViewListIcon from "@mui/icons-material/ViewList";

import {
  BlockConfig
} from "../../../../types/page.types";

import {
  blockExportCapabilities
} from "../../../../export/blockExportCapabilities.generated";

import {
  CollectionListBlock
} from "./CollectionListBlock";

import {
  collectionListFields
} from "./fields";

export const collectionListDefinition: BlockConfig = {
  type: "collectionList",
  label: "Collection List",
  icon:
    React.createElement(ViewListIcon),
  category: "content",
  isContainer: false,
  export:
    blockExportCapabilities.collectionList,
  rules: {
    allowedParents: [
      "root",
      "section",
      "flexItem",
      "gridItem"
    ]
  },
  fields:
    collectionListFields,
  component:
    CollectionListBlock as any,
  defaultData: {
    props: {
      collectionSlug: "",
      titleField: "",
      descriptionField: "",
      imageField: "",
      limit: 6
    },
    style: {
      desktop: {},
      tablet: {},
      mobile: {}
    }
  }
};
