// src/modules/app/hooks/useAppBootstrap.ts

import { useEffect }
from "react";

import {
  useDispatch,
  useSelector
}
from "react-redux";

import {
  useGetSitesQuery
}
from "../../../redux/services/sites.api";

import {
  setSites,
  setCurrentSite
}
from "../../../redux/features/siteSlice";

import {
  RootState
}
from "../../../redux/store";

export const useAppBootstrap = () => {

  const dispatch =
    useDispatch();

  const isAuth =
    useSelector(
      (s: RootState) =>
        s.auth.isAuthenticated
    );

  const currentSite =
    useSelector(
      (s: RootState) =>
        s.site.currentSite
    );

  const { data } =
    useGetSitesQuery(
      undefined,
      {
        skip: !isAuth
      }
    );

  useEffect(() => {

    /**
     * ===========================================
     * VALIDATE DATA
     * ===========================================
     */

    if (
      !data ||
      !Array.isArray(data)
    ) {
      return;
    }

    /**
     * ===========================================
     * SAVE SITES
     * ===========================================
     */

    dispatch(
      setSites(data)
    );

    /**
     * ===========================================
     * RESTORE CURRENT SITE
     * ===========================================
     */

    if (!currentSite) {

      const savedSiteId =
        localStorage.getItem(
          "siteId"
        );

      if (savedSiteId) {

        const found =
          data.find(
            (s: any) =>
              s.id ===
              Number(savedSiteId)
          );

        if (found) {

          dispatch(
            setCurrentSite(found)
          );
        }
      }
    }

  }, [
    data,
    currentSite,
    dispatch
  ]);
};