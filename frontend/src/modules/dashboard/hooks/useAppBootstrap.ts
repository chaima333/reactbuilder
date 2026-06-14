import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useGetSitesQuery } from "../../../redux/services/sites.api";

import {
  setSites,
  setCurrentSite,
  clearSite,
} from "../../../redux/features/siteSlice";

import { RootState } from "../../../redux/store";

export const useAppBootstrap = () => {
  const dispatch = useDispatch();

  const isAuth = useSelector(
    (s: RootState) => s.auth.isAuthenticated
  );

  const currentSite = useSelector(
    (s: RootState) => s.site.currentSite
  );

  const { data } = useGetSitesQuery(undefined, {
    skip: !isAuth,
  });

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      return;
    }

    if (data.length === 0) {
      dispatch(clearSite());
      return;
    }

    dispatch(setSites(data));

    const currentSiteStillAllowed =
      currentSite &&
      data.some((site: any) => site.id === currentSite.id);

    if (!currentSiteStillAllowed) {
      dispatch(setCurrentSite(data[0]));
    }
  }, [data, currentSite, dispatch]);
};