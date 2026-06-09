// presets/navbarPreset.ts

import { SerializedBlock } from "../runtime/importers/html/semanticMatchers";



export const generateNavbarPreset  = (): SerializedBlock => {

  return {

    id:
      "navbar-root",

    type:
      "flex",

    data: {

      props: {},

      style: {

        desktop: {

          display:
            "flex",

          flexDirection:
            "row",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            "24px",

          width:
            "100%",

          paddingTop:
            "16px",

          paddingBottom:
            "16px",

          paddingLeft:
            "24px",

          paddingRight:
            "24px"
        },

        tablet: {

          display:
            "flex",

          flexDirection:
            "row",

          gap:
            "16px"
        },

        mobile: {

          display:
            "flex",

          flexDirection:
            "column",

          gap:
            "12px"
        }
      }
    },

    children: []
  };
};