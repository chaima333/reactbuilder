import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetSitesQuery } from "../../../redux/services/sites.api";
import { setSites, setLoading } from "../../../redux/features/siteSlice";
import { RootState } from "../../../redux/store";

export const useAppBootstrap = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated);

  const { data, isLoading } = useGetSitesQuery(undefined, {
    skip: !isAuth,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));

    if (data) {
      dispatch(setSites(data));
    }
  }, [data, isLoading, dispatch]);
};