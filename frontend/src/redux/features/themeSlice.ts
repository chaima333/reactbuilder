import {
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";

interface ThemeState {
  mode: "light" | "dark";
}

const getInitialTheme = (): "light" | "dark" => {

  if (typeof window === "undefined") {
    return "light";
  }

  const stored =
    localStorage.getItem("theme");

  return stored === "dark"
    ? "dark"
    : "light";
};

const initialState: ThemeState = {
  mode: getInitialTheme()
};

const themeSlice = createSlice({

  name: "theme",

  initialState,

  reducers: {

    toggleTheme: (state) => {

      state.mode =
        state.mode === "light"
          ? "dark"
          : "light";

      localStorage.setItem(
        "theme",
        state.mode
      );
    },

    setTheme: (
      state,
      action: PayloadAction<
        "light" | "dark"
      >
    ) => {

      state.mode = action.payload;

      localStorage.setItem(
        "theme",
        action.payload
      );
    }

  }

});

export const {
  toggleTheme,
  setTheme
} = themeSlice.actions;

export default themeSlice.reducer;