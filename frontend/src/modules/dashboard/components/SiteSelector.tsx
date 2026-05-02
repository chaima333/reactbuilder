import { useDispatch, useSelector } from 'react-redux';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { RootState } from '../../../redux/store';
import { setCurrentSite } from '../../../redux/features/siteSlice';

export const SiteSelector = () => {
  const dispatch = useDispatch();
  const currentSite = useSelector((state: RootState) => state.site.currentSite);
  
  const userSites = useSelector((state: RootState) => (state.auth.user as any)?.sites || []);

  const handleChange = (event: any) => {
    const selectedSite = userSites.find((s: any) => s.id === event.target.value);
    if (selectedSite) {
      dispatch(setCurrentSite(selectedSite));
    }
  };

  return (
    <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
      <InputLabel>Site</InputLabel>
      <Select
        value={currentSite?.id || ''}
        label="Site"
        onChange={handleChange}
      >
        {userSites.map((site: any) => (
          <MenuItem key={site.id} value={site.id}>
            {site.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};