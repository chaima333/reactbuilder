

import {
  valuesGridActions
} from "./valuesGridActions";

import {
  officeTableActions
} from "./officeTableActions";
import { heroActions } from "./herActions";

export const semanticActionRegistry = {

  HERO_SECTION:
    heroActions,

  VALUES_GRID:
    valuesGridActions,

  OFFICES_TABLE:
    officeTableActions
};