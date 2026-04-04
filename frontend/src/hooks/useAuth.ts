import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user,
    isAuthenticated,
    loading,
  };
};