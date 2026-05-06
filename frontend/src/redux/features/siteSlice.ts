// src/redux/slices/siteSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Site } from "../services/sites.api";

interface SiteState {
  sites: Site[];
  currentSite: Site | null;
}

const initialState: SiteState = {
  sites: [],
  currentSite: JSON.parse(
    localStorage.getItem("currentSite") || "null"
  )
};

const siteSlice = createSlice({
  name: "site",

  initialState,

  reducers: {

    setSites: (
      state,
      action: PayloadAction<Site[]>
    ) => {

      state.sites = action.payload;
    },

    setCurrentSite: (
      state,
      action: PayloadAction<Site>
    ) => {

      state.currentSite = action.payload;

      localStorage.setItem(
        "currentSite",
        JSON.stringify(action.payload)
      );
    },

    clearSite: (state) => {

      state.currentSite = null;
      state.sites = [];

      localStorage.removeItem("currentSite");
    }

  }
});

export const {
  setSites,
  setCurrentSite,
  clearSite
} = siteSlice.actions;

export default siteSlice.reducer;