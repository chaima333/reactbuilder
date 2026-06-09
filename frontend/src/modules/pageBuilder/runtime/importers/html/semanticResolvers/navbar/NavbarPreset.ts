import { SemanticPreset } from "./SemanticPreset.types";


export const NavbarPreset:
SemanticPreset = {

  type: "NAVBAR",

  regions: {

    logo: 0,

    navigation: 1,

    actions: 2
  },

  responsiveRules: {

    mobile: {

      collapse: true
    }
  }
};