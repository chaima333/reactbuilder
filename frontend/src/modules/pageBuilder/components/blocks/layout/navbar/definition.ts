import React from "react";
import MenuIcon from "@mui/icons-material/Menu";

import {
  BlockConfig
} from "../../../../types/page.types";

import {
  NavbarBlock
} from "./NavbarBlock";

import {
  navbarDefaults
} from "./defaults";

import {
  navbarFields
} from "./fields";

export const navbarDefinition: BlockConfig = {
  type: "navbar",
  label: "Navbar",
  category: "semantic",
  icon: React.createElement(MenuIcon),
  component: NavbarBlock as any,
  isContainer: true,
  rules: {
    allowedParents: [
      "root",
      "section"
    ],
    allowedChildren: [
      "flexItem"
    ]
  },
  fields: navbarFields,
  defaultData: navbarDefaults
};
