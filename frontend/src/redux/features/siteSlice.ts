// src/redux/slices/siteSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Site } from '../services/sites.api';



interface SiteState {
  sites: Site[];
  currentSite: Site | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SiteState = {
  sites: [],
  currentSite: JSON.parse(localStorage.getItem('currentSite') || 'null'),
  isLoading: false,
  error: null,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    // 🔥 نزيدو هذي باش نملأ قائمة المواقع
    setSites: (state, action: PayloadAction<Site[]>) => {
      state.sites = action.payload;
    },
    setCurrentSite: (state, action: PayloadAction<Site>) => {
      state.currentSite = action.payload;
      localStorage.setItem('currentSite', JSON.stringify(action.payload));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearSite: (state) => {
      state.currentSite = null;
      state.sites = [];
      localStorage.removeItem('currentSite');
    },
  },
});

export const { setSites, setCurrentSite, setLoading, clearSite } = siteSlice.actions;
export default siteSlice.reducer;