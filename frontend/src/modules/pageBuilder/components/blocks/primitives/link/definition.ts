import React from "react";
import LinkIcon from "@mui/icons-material/Link";
import { LinkBlock } from "./LinkBlock";
import { linkDefaults } from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const linkDefinition: BlockConfig = {
  type: "link" as const,
  label: "Link",
  icon: React.createElement(LinkIcon), 
  category: "primitive", 
  isContainer: false,
  fields: [],
  component: LinkBlock,
  defaultData: linkDefaults,
}; 